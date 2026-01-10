import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import * as Sentry from "@sentry/nextjs";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const range = req.nextUrl?.searchParams?.get("range") || "30";
    const month = req.nextUrl?.searchParams?.get("month"); // Format: YYYY-MM
    const now = new Date();
    
    let periodStartISO, periodEndISO, periodDays;
    
    if (month) {
      // Month-based filtering (e.g., "2026-01" for January 2026)
      const [year, monthNum] = month.split("-").map(Number);
      const startOfMonth = new Date(year, monthNum - 1, 1);
      const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);
      periodStartISO = startOfMonth.toISOString();
      periodEndISO = endOfMonth.toISOString();
      periodDays = endOfMonth.getDate(); // Days in the month
    } else {
      // Range-based filtering (original behavior)
      const periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - parseInt(range));
      periodStartISO = periodStart.toISOString();
      periodEndISO = now.toISOString();
      periodDays = parseInt(range);
    }

    // 1. SALES DATA with items - include product cost/price as fallback
    let salesQuery = supabase
      .from("sales")
      .select(`
        id, total, client_id, created_at,
        sales_items (quantity, price, cost, subtotal, margin, product_id, products (cost, price))
      `)
      .eq("org_id", orgId)
      .gte("created_at", periodStartISO);
    
    // Add upper bound for month filtering
    if (month) {
      salesQuery = salesQuery.lte("created_at", periodEndISO);
    }
    
    const { data: salesData, error: salesError } = await salesQuery;

    if (salesError) {
      console.error("Sales query error:", salesError);
    }

    let revenue = 0, grossProfit = 0, cogs = 0;
    const clientSales = {}, productSales = {};

    (salesData || []).forEach((sale) => {
      (sale.sales_items || []).forEach((item) => {
        const itemPrice = Number(item.price) || Number(item.products?.price) || 0;
        const itemCost = Number(item.cost) || Number(item.products?.cost) || 0;
        const qty = Number(item.quantity) || 0;
        
        const itemRevenue = Number(item.subtotal) || (qty * itemPrice);
        const itemCostTotal = itemCost * qty;
        // Always calculate margin as revenue - cost (don't use stored margin which may be incorrect)
        const itemMargin = itemRevenue - itemCostTotal;

        revenue += itemRevenue;
        cogs += itemCostTotal;

        if (sale.client_id) {
          if (!clientSales[sale.client_id]) {
            clientSales[sale.client_id] = { totalSales: 0, totalCost: 0, orderCount: 0 };
          }
          clientSales[sale.client_id].totalSales += itemRevenue;
          clientSales[sale.client_id].totalCost += itemCostTotal;
        }

        if (item.product_id) {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { quantitySold: 0, revenue: 0, cost: 0 };
          }
          productSales[item.product_id].quantitySold += qty;
          productSales[item.product_id].revenue += itemRevenue;
          productSales[item.product_id].cost += itemCostTotal;
        }
      });

      if (sale.client_id && clientSales[sale.client_id]) {
        clientSales[sale.client_id].orderCount += 1;
      }
    });

    // Calculate gross profit correctly as revenue - cogs (not from stored margins which may be incorrect)
    grossProfit = revenue - cogs;
    const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const markupPct = cogs > 0 ? ((revenue - cogs) / cogs) * 100 : 0;

    // 2. INVENTORY DATA - Use current_stock view (correct table!)
    const { data: stockData, error: invError } = await supabase
      .from("current_stock")
      .select("*")
      .eq("org_id", orgId);

    if (invError) {
      console.error("Inventory query error:", invError);
    }

    let inventoryValue = 0, potentialRevenue = 0, potentialGrossProfit = 0;
    const categoryInventory = {};

    (stockData || []).forEach((item) => {
      const qty = Number(item.stock) || 0;
      const cost = Number(item.cost) || 0;
      const price = Number(item.price) || 0;
      const category = item.category || "Sin categoria";

      inventoryValue += qty * cost;
      potentialRevenue += qty * price;
      potentialGrossProfit += qty * (price - cost);

      if (!categoryInventory[category]) {
        categoryInventory[category] = { inventoryValue: 0, potentialRevenue: 0, potentialGrossProfit: 0, totalUnits: 0 };
      }
      categoryInventory[category].inventoryValue += qty * cost;
      categoryInventory[category].potentialRevenue += qty * price;
      categoryInventory[category].potentialGrossProfit += qty * (price - cost);
      categoryInventory[category].totalUnits += qty;
    });

    const effectiveCogs = cogs > 0 ? cogs : (potentialRevenue * 0.6);
    const inventoryTurnover = inventoryValue > 0 ? ((effectiveCogs / periodDays) * 365) / inventoryValue : 0;
    const daysInventoryOnHand = effectiveCogs > 0 ? (inventoryValue / effectiveCogs) * periodDays : (inventoryValue > 0 ? 999 : 0);

    // 3. TOP 10 CLIENTS
    const clientIds = Object.keys(clientSales);
    let topClients = [];
    if (clientIds.length > 0) {
      const { data: clients } = await supabase.from("clients").select("id, name, phone").in("id", clientIds);
      topClients = clientIds.map((id) => {
        const client = clients?.find((c) => c.id === id);
        const clientData = clientSales[id];
        const clientMargin = clientData.totalSales - clientData.totalCost;
        return {
          id, name: client?.name || "Cliente desconocido", phone: client?.phone || "",
          totalSales: clientData.totalSales,
          totalMargin: clientMargin,
          orderCount: clientData.orderCount,
          marginPct: clientData.totalSales > 0 ? (clientMargin / clientData.totalSales) * 100 : 0,
        };
      }).sort((a, b) => b.totalSales - a.totalSales).slice(0, 10);
    }

    // 4. TOP 10 PRODUCTS
    const productIds = Object.keys(productSales);
    let topProducts = [];
    if (productIds.length > 0) {
      const { data: products } = await supabase.from("products").select("id, name, category, sku").in("id", productIds);
      topProducts = productIds.map((id) => {
        const product = products?.find((p) => p.id === id);
        const productData = productSales[id];
        const productMargin = productData.revenue - productData.cost;
        return {
          id, name: product?.name || "Producto desconocido", category: product?.category || "", sku: product?.sku || "",
          quantitySold: productData.quantitySold,
          revenue: productData.revenue,
          grossProfit: productMargin,
          marginPct: productData.revenue > 0 ? (productMargin / productData.revenue) * 100 : 0,
        };
      }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);
    }

    // 5. INVENTORY BY CATEGORY
    const inventoryByCategory = Object.entries(categoryInventory).map(([category, data]) => ({
      category, ...data,
      marginPct: data.potentialRevenue > 0 ? (data.potentialGrossProfit / data.potentialRevenue) * 100 : 0,
    })).sort((a, b) => b.inventoryValue - a.inventoryValue);

    // 6. LOW STOCK - Use current_stock view
    const lowStock = (stockData || [])
      .filter(item => {
        const qty = Number(item.stock) || 0;
        const minStock = Number(item.min_stock) || 10;
        return qty < minStock && item.active !== false;
      })
      .map(item => ({
        quantity: item.stock,
        products: {
          id: item.product_id,
          name: item.name,
          min_stock: item.min_stock,
          category: item.category
        }
      }));

    // 7. COUNTS
    const { count: clientsCount } = await supabase.from("clients").select("*", { count: "exact", head: true }).eq("org_id", orgId);
    const { count: productsCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("org_id", orgId);
    const { count: employeesCount } = await supabase.from("employees").select("*", { count: "exact", head: true }).eq("org_id", orgId).eq("status", "activo");

    // 8. CRM PIPELINE VALUE
    let pipelineValue = 0;
    try {
      const { data: opportunities } = await supabase.from("crm_opportunities").select("amount").eq("org_id", orgId).eq("status", "open");
      pipelineValue = opportunities?.reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 0;
    } catch (e) { }

    return NextResponse.json({
      period: { days: periodDays, from: periodStartISO, to: now.toISOString() },
      kpis: {
        revenue, grossProfit, cogs,
        grossMarginPct: Math.round(grossMarginPct * 100) / 100,
        markupPct: Math.round(markupPct * 100) / 100,
        inventoryValue, potentialRevenue, potentialGrossProfit,
        clientsCount: clientsCount || 0,
        productsCount: productsCount || 0,
        employeesCount: employeesCount || 0,
        salesCount: salesData?.length || 0,
        pipelineValue,
      },
      profitability: {
        grossMarginPct: Math.round(grossMarginPct * 100) / 100,
        markupPct: Math.round(markupPct * 100) / 100,
        inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
        daysInventoryOnHand: Math.round(daysInventoryOnHand),
      },
      topClients,
      topProducts,
      inventoryByCategory,
      lowStock,
    });
  } catch (error) {
    Sentry.captureException(error);
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
