import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    // --- Initialize Supabase Service Role ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { autoRefreshToken: false, persistSession: false },
      }
    );

    // -------------------------------
    // 1️⃣ Read headers
    // -------------------------------
    const orgId = req.headers.get("x-org-id");
    const productId = req.headers.get("x-product-id") || null;
    const branchId = req.headers.get("x-branch-id") || null;
    const movementType = req.headers.get("x-movement-type") || null;

    if (!orgId) {
      return NextResponse.json({ error: "Missing orgId" }, { status: 400 });
    }

    // -------------------------------
    // 2️⃣ Read query params
    // -------------------------------
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // -------------------------------
    // 3️⃣ Base query
    // -------------------------------
    
  let query = supabase
  .from("inventory_movements")
  .select(
    `
    id,
    movement_type,
    qty,
    cost,
    price,
    expires_at,
    lot,
    created_at,
    reference,

    -- JOIN PRODUCT
    products:product_id (
      id, name, category
    ),

    -- JOIN BRANCHES
    from_branch ( id, name ),
    to_branch ( id, name ),

    -- JOIN USER (created_by)
    user:created_by (
      id,
      full_name,
      email
    )
  `
  )
  .eq("org_id", orgId)
  .order("created_at", { ascending: false })
  .range(offset, offset + limit - 1);


    // -------------------------------
    // 4️⃣ Filters
    // -------------------------------
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

    // -------------------------------
    // 5️⃣ Execute
    // -------------------------------
    const { data, error } = await query;

    if (error) throw error;

    // -------------------------------
    // 6️⃣ Format response
    // -------------------------------
    const formatted = data.map((m) => ({
      id: m.id,
      movement_type: m.movement_type,
      qty: Number(m.qty),
      cost_unit: Number(m.cost),
      price_unit: Number(m.price),
      total_cost: Number(m.qty) * Number(m.cost),
      total_value: Number(m.qty) * Number(m.price),

      expiration_date: m.expires_at,
      lot: m.lot,

      created_at: m.created_at,
      reference: m.reference,

      product: {
        id: m.products?.id,
        name: m.products?.name,
        category: m.products?.category,
      },

      from_branch: m.from_branch ? m.from_branch.name : null,
      to_branch: m.to_branch ? m.to_branch.name : null,
    }));

    // -------------------------------
    // 7️⃣ Final response
    // -------------------------------
    return NextResponse.json({
      success: true,
      count: formatted.length,
      data: formatted,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (err) {
    console.error("Kardex API ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
