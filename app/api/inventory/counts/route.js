import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId");

    let query = supabase
      .from("inventory_counts")
      .select(`
        *,
        branch:branches(name),
        items:inventory_count_items(
          *,
          product:products(name, sku, category)
        )
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data: counts, error } = await query;

    if (error) throw error;

    return NextResponse.json({ counts: counts || [] });
  } catch (err) {
    console.error("Error fetching counts:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    const { branchId, notes, items } = body;

    if (!branchId) {
      return NextResponse.json({ error: "Branch ID is required" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Items are required" }, { status: 400 });
    }

    const { data: count, error: countError } = await supabase
      .from("inventory_counts")
      .insert({
        org_id: orgId,
        branch_id: branchId,
        status: "completed",
        notes,
        created_by: userId,
        completed_by: userId,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (countError) throw countError;

    const countItems = items.map((item) => ({
      count_id: count.id,
      product_id: item.productId,
      expected_qty: item.expectedQty,
      counted_qty: item.countedQty,
      reason: item.reason || null,
      notes: item.notes || null,
      counted_by: userId,
      counted_at: new Date().toISOString(),
    }));

    const { error: itemsError } = await supabase
      .from("inventory_count_items")
      .insert(countItems);

    if (itemsError) throw itemsError;

    const adjustments = items.filter((item) => item.countedQty !== null && item.countedQty !== item.expectedQty);

    for (const item of adjustments) {
      const difference = item.countedQty - item.expectedQty;
      const qty = Math.abs(difference);

      await supabase.from("inventory_movements").insert({
        org_id: orgId,
        product_id: item.productId,
        qty,
        type: "ajuste",
        reference: `Ajuste por conteo fisico: ${item.reason || "Sin razon"}`,
        from_branch: branchId,
        to_branch: branchId,
        created_by: userId,
      });

      await supabase.from("kardex").insert({
        org_id: orgId,
        product_id: item.productId,
        movement_type: "ADJUSTMENT",
        quantity: difference,
        branch_id: branchId,
        reference: `Conteo fisico: ${item.reason || "Ajuste"} - ${item.notes || ""}`,
        created_by: userId,
      });

      if (difference > 0) {
        await supabase.rpc("increase_inventory", {
          p_org_id: orgId,
          p_product_id: item.productId,
          p_branch_id: branchId,
          p_quantity: qty,
        });
      } else {
        await supabase.rpc("decrease_inventory", {
          p_org_id: orgId,
          p_product_id: item.productId,
          p_branch_id: branchId,
          p_quantity: qty,
        });
      }
    }

    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("Error creating count:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}