import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(req, { params }) {
  const productId = params.id;
  const orgId = req.headers.get("x-org-id");

  if (!orgId) {
    return NextResponse.json(
      { error: "Missing orgId" },
      { status: 400 }
    );
  }

  try {
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
