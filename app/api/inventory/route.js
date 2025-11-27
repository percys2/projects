import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();

    const orgSlug = req.headers.get("x-org-slug");
    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    // 1. Obtener org_id real desde el slug
    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const orgId = org.id;

    // 2. Inventario agrupado por producto + sucursal
    const { data: inventory, error: invError } = await supabase
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
          sku,
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

    if (invError) throw invError;

    // 3. Categorías
    const { data: categories } = await supabase
      .from("categories")
      .select("name")
      .eq("org_id", orgId);

    // 4. Sucursales
    const { data: branches } = await supabase
      .from("branches")
      .select("name")
      .eq("org_id", orgId);

    return NextResponse.json({
      inventory,
      categories: categories?.map((c) => c.name) ?? [],
      branches: branches?.map((b) => b.name) ?? [],
    });

  } catch (err) {
    console.error("API INVENTORY ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}