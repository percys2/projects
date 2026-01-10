import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req, { params }) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;

    const productId = params.id;

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        category,
        sku,
        unit_weight,
        min_stock,
        line,
        description,
        price,
        created_at
      `)
      .eq("id", productId)
      .eq("org_id", orgId)
      .single();

    if (error) throw error;

    return NextResponse.json({ product: data });
  } catch (err) {
    console.error("Error fetching product:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}