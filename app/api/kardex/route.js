import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();

    const orgSlug = req.headers.get("x-org-slug");
    const productId = req.headers.get("x-product-id") || null;
    const branchId = req.headers.get("x-branch-id") || null;
    const movementType = req.headers.get("x-movement-type") || null;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing orgSlug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = org.id;

    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = supabase
      .from("inventory_movements")
      .select(`
        id,
        movement_type,
        qty,
        cost,
        price,
        expires_at,
        lot,
        created_at,
        reference,
        products:product_id (id, name, category),
        from_branch (id, name),
        to_branch (id, name)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (productId && productId !== "all") {
      query = query.eq("product_id", productId);
    }

    if (branchId && branchId !== "all") {
      query = query.or(`from_branch.eq.${branchId},to_branch.eq.${branchId}`);
    }

    if (movementType && movementType !== "all") {
      query = query.eq("movement_type", movementType);
    }

    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const formatted = (data || []).map((m) => ({
      id: m.id,
      movement_type: m.movement_type,
      qty: Number(m.qty),
      cost_unit: Number(m.cost || 0),
      price_unit: Number(m.price || 0),
      total_cost: Number(m.qty) * Number(m.cost || 0),
      total_value: Number(m.qty) * Number(m.price || 0),
      expiration_date: m.expires_at,
      lot: m.lot,
      created_at: m.created_at,
      reference: m.reference,
      product: {
        id: m.products?.id,
        name: m.products?.name,
        category: m.products?.category,
      },
      from_branch: m.from_branch?.name || null,
      to_branch: m.to_branch?.name || null,
    }));

    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
      pagination: { limit, offset },
    });
  } catch (err) {
    console.error("Kardex API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}