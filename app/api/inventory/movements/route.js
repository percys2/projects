import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    const {
      productId,
      branchId,
      qty,
      type,
      cost,
      notes,
      from_branch,
      to_branch,
    } = body;

    if (!orgSlug)
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    if (!productId || !qty || !type)
      return NextResponse.json(
        { error: "Missing required fields (productId, qty, type)" },
        { status: 400 }
      );

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const orgId = org.id;

    // NORMALIZACIÓN
    let fromBranch = null;
    let toBranch = null;

    if (type === "entrada") toBranch = branchId;
    if (type === "salida") fromBranch = branchId;
    if (type === "transferencia") {
      fromBranch = from_branch;
      toBranch = to_branch;
    }
    if (type === "ajuste") {
      fromBranch = branchId;
      toBranch = branchId;
    }

    // INSERTAR EN inventory_movements
    const { data: movement, error } = await supabase
      .from("inventory_movements")
      .insert({
        org_id: orgId,
        product_id: productId,
        qty: Number(qty),
        type: type,
        cost: cost || null,
        reference: notes || null,
        from_branch: fromBranch,
        to_branch: toBranch,
        created_by: user.id,
      })
      .select("*")
      .single();

    if (error) throw error;

    // ACTUALIZAR current_stock
    if (type === "entrada")
      await supabase.rpc("increase_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_branch_id: toBranch,
        p_quantity: Number(qty),
      });

    if (type === "salida")
      await supabase.rpc("decrease_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_branch_id: fromBranch,
        p_quantity: Number(qty),
      });

    if (type === "transferencia")
      await supabase.rpc("transfer_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_from_branch: fromBranch,
        p_to_branch: toBranch,
        p_quantity: Number(qty),
      });

    return NextResponse.json({ success: true, movement });

  } catch (err) {
    console.error("MOVEMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
