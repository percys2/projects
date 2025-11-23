import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = createServerSupabaseClient();
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
      return NextResponse.json({ error: "Missing org ID" }, { status: 400 });
    }

    // ---- VENTAS DEL MES ----
    const { data: sales } = await supabase
      .from("sales")
      .select("total")
      .eq("org_id", orgId);

    const totalSales = sales?.reduce((acc, s) => acc + Number(s.total), 0) || 0;

    // ---- CLIENTES ----
    const { count: clientsCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId);

    // ---- PRODUCTOS ----
    const { count: productsCount } = await supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("org_id", orgId);

    // ---- VALOR TOTAL INVENTARIO ----
    const { data: inventory } = await supabase
      .from("inventory")
      .select("quantity, cost")
      .eq("org_id", orgId);

    const inventoryValue = inventory?.reduce(
      (acc, item) => acc + Number(item.quantity) * Number(item.cost),
      0
    ) || 0;

    // ---- STOCK CRÍTICO ----
    const { data: lowStock } = await supabase
      .from("inventory")
      .select("quantity, product_id, products(name)")
      .eq("org_id", orgId)
      .lt("quantity", 10);

    return NextResponse.json({
      totalSales,
      clientsCount,
      productsCount,
      inventoryValue,
      lowStock,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
