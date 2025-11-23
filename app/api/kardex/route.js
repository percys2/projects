import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export async function GET(req) {
  try {
    const orgId = req.headers.get("x-org-id");
    const productId = req.headers.get("x-product-id");

    if (!orgId || !productId) {
      return NextResponse.json(
        { error: "Missing orgId or productId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_movements")
      .select("*")
      .eq("org_id", orgId)
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ movements: data });
  } catch (err) {
    console.error("Kardex API error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
