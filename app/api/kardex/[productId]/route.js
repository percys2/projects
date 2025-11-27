import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const productId = params.productId;
    const orgId = req.headers.get("x-org-id");

    if (!productId || !orgId)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data, error } = await supabase
      .from("inventory_movements")
      .select(`
        id,
        created_at,
        type,
        qty,
        cost,
        price,
        lot,
        expires_at,
        from_branch:from_branch(name),
        to_branch:to_branch(name),
        products:product_id(name, sku, unit_weight)
      `)
      .eq("product_id", productId)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ kardex: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}