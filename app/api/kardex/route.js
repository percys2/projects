import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;

    const orgSlug = req.headers.get("x-org-slug");
    const productId = req.headers.get("x-product-id");
    const branchId = req.headers.get("x-branch-id");
    const movementType = req.headers.get("x-movement-type");
    const search = req.headers.get("x-search") || "";

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    if (!orgSlug)
      return NextResponse.json({ success: false, error: "Missing org slug" });

    // Get org_id
    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org)
      return NextResponse.json({ success: false, error: "Org not found" });

    let query = supabase
      .from("kardex_view")
      .select("*")
      .eq("org_id", org.id)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (productId && productId !== "all")
      query = query.eq("product_id", productId);

    if (branchId && branchId !== "all") {
      query = query.or(
        `from_branch.eq.${branchId},to_branch.eq.${branchId},branch_id.eq.${branchId}`
      );
    }

    if (movementType && movementType !== "all")
      query = query.eq("movement_type", movementType);

    // Search text
    if (search) {
      query = query.or(
        `product_name.ilike.%${search}%,reference.ilike.%${search}%,user_email.ilike.%${search}%`
      );
    }

    if (startDate)
      query = query.gte("created_at", `${startDate} 00:00:00`);

    if (endDate)
      query = query.lte("created_at", `${endDate} 23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });

  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err.message,
    });
  }
}
