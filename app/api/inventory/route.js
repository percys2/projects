import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = createServerSupabaseClient();
    const orgId = req.headers.get("x-org-id");

    if (!orgId) {
      return NextResponse.json({ error: "Missing org ID" }, { status: 400 });
    }

    // ================================
    // 1️⃣ TRAER INVENTARIO COMPLETO
    // ================================
    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .select(`
        id,
        quantity,
        cost,
        price,
        expiration_date,
        lot_number,
        products (
          id,
          name,
          category,
          unit_weight,
          min_stock
        ),
        branches (
          id,
          name
        )
      `)
      .eq("org_id", orgId);

    if (inventoryError) throw inventoryError;

    // ================================
    // 2️⃣ TRAER CATEGORÍAS DISTINCT
    // ================================
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("products")
      .select("category")
      .eq("org_id", orgId)
      .not("category", "is", null);

    if (categoriesError) throw categoriesError;

    const categories = Array.from(
      new Set(categoriesData.map((c) => c.category))
    );

    // ================================
    // 3️⃣ TRAER SUCURSALES DISTINCT
    // ================================
    const { data: branchesData, error: branchesError } = await supabase
      .from("branches")
      .select("name")
      .eq("org_id", orgId);

    if (branchesError) throw branchesError;

    const branches = branchesData.map((b) => b.name);

    // ================================
    // 4️⃣ RESPUESTA COMPLETA
    // ================================
    return NextResponse.json({
      inventory,
      categories,
      branches,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
