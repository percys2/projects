import { respond } from "@/src/lib/core/respond";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/**
 * GET - Calcular KPIs del Agroservicio
 * Basado en datos del POS + Inventario + Kardex
 */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const url = new URL(req.url);
  const startDate = url.searchParams.get("start");
  const endDate = url.searchParams.get("end");

  try {
    // 1. Obtener ventas del período
    let salesQuery = supabase
      .from("sales")
      .select(`
        *,
        sales_items (
          *,
          products (
            id,
            name,
            category,
            cost_price,
            sale_price
          )
        ),
        clients (
          id,
          name
        )
      `)
      .eq("org_id", org_id);

    if (startDate) salesQuery = salesQuery.gte("sale_date", startDate);
    if (endDate) salesQuery = salesQuery.lte("sale_date", endDate);

    const { data: sales, error: salesError } = await salesQuery;
    if (salesError) throw salesError;

    // 2. Obtener gastos del período
    let expensesQuery = supabase
      .from("finance_transactions")
      .select("*")
      .eq("org_id", org_id)
      .eq("type", "expense");

    if (startDate) expensesQuery = expensesQuery.gte("date", startDate);
    if (endDate) expensesQuery = expensesQuery.lte("date", endDate);

    const { data: expenses, error: expensesError } = await expensesQuery;
    if (expensesError) throw expensesError;

    // 3. Calcular KPIs
    const kpis = calculateKPIs(sales, expenses || []);

    return respond({ kpis });
  } catch (error) {
    console.error("Error calculating KPIs:", error);
    return respond({ error: error.message }, 500);
  }
}

function calculateKPIs(sales, expenses) {
  // Inicializar totales
  let totalSales = 0;
  let totalCOGS = 0;
  let totalExpenses = 0;
  
  const categoryData = {};
  const productData = {};
  const customerData = {};
  const dailySales = {};

  // Procesar ventas
  sales.forEach((sale) => {
    const saleTotal = parseFloat(sale.total) || 0;
    totalSales += saleTotal;

    // Procesar items de la venta
    sale.sales_items?.forEach((item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const salePrice = parseFloat(item.sale_price) || 0;
      const costPrice = parseFloat(item.products?.cost_price) || 0;
      const category = item.products?.category || "Sin categoría";
      const productId = item.product_id;
      const productName = item.products?.name || "Producto desconocido";

      const itemSales = quantity * salePrice;
      const itemCOGS = quantity * costPrice;
      const itemMargin = itemSales - itemCOGS;

      totalCOGS += itemCOGS;

      // Agrupar por categoría
      if (!categoryData[category]) {
        categoryData[category] = { sales: 0, cogs: 0, margin: 0 };
      }
      categoryData[category].sales += itemSales;
      categoryData[category].cogs += itemCOGS;
      categoryData[category].margin += itemMargin;

      // Agrupar por producto
      if (!productData[productId]) {
        productData[productId] = {
          product_id: productId,
          product_name: productName,
          quantity: 0,
          total_sales: 0,
          total_cost: 0,
          margin: 0,
        };
      }
      productData[productId].quantity += quantity;
      productData[productId].total_sales += itemSales;
      productData[productId].total_cost += itemCOGS;
      productData[productId].margin += itemMargin;
    });

    // Agrupar por cliente
    const clientId = sale.client_id;
    const clientName = sale.clients?.name || "Cliente general";
    if (!customerData[clientId]) {
      customerData[clientId] = {
        client_id: clientId,
        client_name: clientName,
        total_spent: 0,
        purchase_count: 0,
      };
    }
    customerData[clientId].total_spent += saleTotal;
    customerData[clientId].purchase_count += 1;

    // Agrupar por día
    const saleDate = sale.sale_date?.split('T')[0];
    if (!dailySales[saleDate]) {
      dailySales[saleDate] = { inflow: 0, outflow: 0 };
    }
    dailySales[saleDate].inflow += saleTotal;
  });

  // Procesar gastos
  expenses.forEach((expense) => {
    const amount = parseFloat(expense.amount) || 0;
    totalExpenses += amount;

    const expenseDate = expense.date?.split('T')[0];
    if (!dailySales[expenseDate]) {
      dailySales[expenseDate] = { inflow: 0, outflow: 0 };
    }
    dailySales[expenseDate].outflow += amount;
  });

  // Calcular métricas derivadas
  const netProfit = totalSales - totalCOGS - totalExpenses;
  const netMarginPercent = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;
  const averageTicket = sales.length > 0 ? totalSales / sales.length : 0;
  
  // Inventario promedio (simplificado, asumimos inventario actual)
  const avgInventory = totalCOGS * 0.3; // Aproximación
  const inventoryTurnover = avgInventory > 0 ? totalCOGS / avgInventory : 0;

  // Clientes únicos
  const activeCustomers = Object.keys(customerData).length;
  const newCustomers = Object.values(customerData).filter(c => c.purchase_count === 1).length;

  // Ventas por día
  const daysInPeriod = Object.keys(dailySales).length || 1;
  const salesPerDay = totalSales / daysInPeriod;

  // Preparar datos para respuesta
  const marginByCategory = Object.entries(categoryData).map(([category, data]) => ({
    category,
    sales: data.sales,
    cogs: data.cogs,
    margin: data.margin,
    marginPercent: data.sales > 0 ? (data.margin / data.sales) * 100 : 0,
  }));

  const topProducts = Object.values(productData)
    .sort((a, b) => b.total_sales - a.total_sales);

  const topCustomers = Object.values(customerData)
    .sort((a, b) => b.total_spent - a.total_spent);

  const productProfitability = Object.values(productData)
    .map(p => ({
      ...p,
      avg_price: p.quantity > 0 ? p.total_sales / p.quantity : 0,
      avg_cost: p.quantity > 0 ? p.total_cost / p.quantity : 0,
      marginPercent: p.total_sales > 0 ? (p.margin / p.total_sales) * 100 : 0,
    }))
    .sort((a, b) => b.marginPercent - a.marginPercent);

  const dailyCashFlow = Object.entries(dailySales)
    .map(([date, data]) => ({
      date,
      inflow: data.inflow,
      outflow: data.outflow,
      net: data.inflow - data.outflow,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  return {
    // KPIs Financieros
    totalSales,
    totalCOGS,
    totalExpenses,
    netProfit,
    netMarginPercent,
    marginByCategory,

    // KPIs Operativos
    averageTicket,
    totalTransactions: sales.length,
    inventoryTurnover,
    activeCustomers,
    newCustomers,
    salesPerDay,
    topProducts,
    topCustomers,

    // Flujo de Caja
    cashInflow: totalSales,
    cashOutflow: totalExpenses,
    netCashFlow: totalSales - totalExpenses,
    dailyCashFlow,

    // KPIs Específicos
    productProfitability,
    
    // Nota: inventoryByLocation requeriría datos de sucursales en la BD
    inventoryByLocation: null,
  };
}
