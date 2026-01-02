import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get stock from current_stock view
    const { data: stock, error } = await supabase
      .from("current_stock")
      .select("*")
      .eq("org_id", org.id)
      .order("name");

    if (error) throw error;

    // Get products with subcategory
    const { data: products } = await supabase
      .from("products")
      .select("id, subcategory")
      .eq("org_id", org.id);

    // Create a map of product_id -> subcategory
    const subcategoryMap = {};
    if (products) {
      products.forEach(p => {
        subcategoryMap[p.id] = p.subcategory;
      });
    }

    // Merge subcategory into stock items
    const enrichedStock = (stock || [])
      .filter(item => item.active !== false)
      .map(item => ({
        ...item,
        subcategory: subcategoryMap[item.product_id] || null,
      }));

    // Get branches
    const { data: branches } = await supabase
      .from("branches")
      .select("*")
      .eq("org_id", org.id);

    return NextResponse.json({ stock: enrichedStock, branches });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}