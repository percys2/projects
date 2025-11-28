import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();

    const orgSlug = req.headers.get("x-org-slug");
    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const orgId = org.id;

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

    const { data: categories } = await supabase
      .from("categories")
      .select("name")
      .eq("org_id", orgId);

    const { data: branches } = await supabase
      .from("branches")
      .select("id, name")
      .eq("org_id", orgId);

    return NextResponse.json({
      inventory,
      categories: categories?.map((c) => c.name) ?? [],
      branches: branches || [],
    });

  } catch (err) {
    console.error("API INVENTORY ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}