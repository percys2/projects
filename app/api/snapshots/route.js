import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

// GET - Obtener snapshots históricos
export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year");
    const limit = parseInt(searchParams.get("limit") || "12");

    let query = supabaseAdmin
      .from("org_monthly_snapshots")
      .select("*")
      .eq("org_id", context.orgId)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(limit);

    if (year) {
      query = query.eq("year", parseInt(year));
    }

    const { data: snapshots, error } = await query;
    if (error) throw error;

    return NextResponse.json({ snapshots });
  } catch (err) {
    console.error("GET snapshots error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Generar snapshot para un mes específico
export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const body = await req.json();
    const now = new Date();
    const year = body.year || now.getFullYear();
    const month = body.month || now.getMonth(); // 0-indexed, mes anterior si no se especifica

    // Calcular rango de fechas del mes
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const startISO = startDate.toISOString();
    const endISO = endDate.toISOString();

    // Obtener ventas del mes
    const { data: sales } = await supabaseAdmin
      .from("sales")
      .select("*, sales_items(*)")
      .eq("org_id", context.orgId)
      .gte("fecha", startISO)
      .lte("fecha", endISO)
      .not("status", "in", "(canceled,refunded)");

    const validSales = sales || [];
    const totalRevenue = validSales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    let totalCOGS = 0;
    validSales.forEach((s) => {
      if (s.sales_items) {
        s.sales_items.forEach((item) => {
          totalCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
        });
      }
    });

    // Obtener gastos del mes
    const { data: expenses } = await supabaseAdmin
      .from("expenses")
      .select("*")
      .eq("org_id", context.orgId)
      .gte("date", startISO)
      .lte("date", endISO);

    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (e.total || 0), 0);

    // Agrupar gastos por categoría
    const expensesByCategory = {};
    (expenses || []).forEach((e) => {
      const cat = e.category || "Otros";
      expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.total || 0);
    });

    // Obtener inventario actual
    const { data: inventory } = await supabaseAdmin
      .from("inventory")
      .select("*, products(cost, price)")
      .eq("org_id", context.orgId);

    const inventoryValue = (inventory || []).reduce(
      (sum, i) => sum + ((i.quantity || 0) * (i.products?.cost || 0)),
      0
    );
    const lowStockCount = (inventory || []).filter((i) => i.quantity <= (i.min_stock || 5)).length;

    // Obtener conteo de clientes
    const { count: clientsCount } = await supabaseAdmin
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("org_id", context.orgId);

    // Clientes nuevos del mes
    const { count: newClientsCount } = await supabaseAdmin
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("org_id", context.orgId)
      .gte("created_at", startISO)
      .lte("created_at", endISO);

    // Obtener empleados
    const { count: employeesCount } = await supabaseAdmin
      .from("employees")
      .select("*", { count: "exact", head: true })
      .eq("org_id", context.orgId)
      .eq("status", "activo");

    // Obtener productos
    const { count: productsCount } = await supabaseAdmin
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("org_id", context.orgId);

    // Top 10 productos
    const productSales = {};
    validSales.forEach((s) => {
      if (s.sales_items) {
        s.sales_items.forEach((item) => {
          const key = item.product_id;
          if (!productSales[key]) {
            productSales[key] = { id: key, name: item.product_name || "Producto", quantity: 0, revenue: 0 };
          }
          productSales[key].quantity += parseInt(item.quantity) || 0;
          productSales[key].revenue += (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 0);
        });
      }
    });
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top 10 clientes
    const clientSales = {};
    validSales.forEach((s) => {
      const key = s.client_id || "anonymous";
      if (!clientSales[key]) {
        clientSales[key] = { id: key, name: s.clients?.name || "Consumidor Final", orders: 0, total: 0 };
      }
      clientSales[key].orders += 1;
      clientSales[key].total += parseFloat(s.total) || 0;
    });
    const topClients = Object.values(clientSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    // Ventas por sucursal
    const salesByBranch = {};
    validSales.forEach((s) => {
      const branch = s.branch_id || "main";
      salesByBranch[branch] = (salesByBranch[branch] || 0) + (parseFloat(s.total) || 0);
    });

    // Crear o actualizar snapshot
    const snapshotData = {
      org_id: context.orgId,
      year,
      month,
      total_revenue: totalRevenue,
      total_cogs: totalCOGS,
      gross_profit: totalRevenue - totalCOGS,
      sales_count: validSales.length,
      average_ticket: validSales.length > 0 ? totalRevenue / validSales.length : 0,
      total_expenses: totalExpenses,
      net_income: totalRevenue - totalCOGS - totalExpenses,
      inventory_value: inventoryValue,
      products_count: productsCount || 0,
      low_stock_count: lowStockCount,
      clients_count: clientsCount || 0,
      new_clients_count: newClientsCount || 0,
      employees_count: employeesCount || 0,
      payroll_total: 0, // TODO: calcular de payroll_history
      top_products: topProducts,
      top_clients: topClients,
      sales_by_branch: salesByBranch,
      expenses_by_category: expensesByCategory,
    };

    const { data: snapshot, error } = await supabaseAdmin
      .from("org_monthly_snapshots")
      .upsert(snapshotData, { onConflict: "org_id,year,month" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      snapshot,
      message: `Snapshot generado para ${month}/${year}`
    });
  } catch (err) {
    console.error("POST snapshot error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
