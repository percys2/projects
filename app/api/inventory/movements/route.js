import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;

    // User ID can be passed via header if available
    const userId = req.headers.get("x-user-id") || null;

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

    // NORMALIZACIÓN - accept both branchId and to_branch/from_branch for compatibility
    let fromBranch = null;
    let toBranch = null;

    // For entrada: use branchId if provided, otherwise fall back to to_branch
    if (type === "entrada") {
      toBranch = branchId || to_branch;
    }
    // For salida: use branchId if provided, otherwise fall back to from_branch
    if (type === "salida") {
      fromBranch = branchId || from_branch;
    }
    if (type === "transferencia") {
      fromBranch = from_branch;
      toBranch = to_branch;
    }
    if (type === "ajuste") {
      const adjustBranch = branchId || from_branch || to_branch;
      fromBranch = adjustBranch;
      toBranch = adjustBranch;
    }

    // Validate branch is provided for entrada/salida
    if (type === "entrada" && !toBranch) {
      return NextResponse.json(
        { error: "Debe seleccionar una sucursal para registrar la entrada" },
        { status: 400 }
      );
    }
    if (type === "salida" && !fromBranch) {
      return NextResponse.json(
        { error: "Debe seleccionar una sucursal para registrar la salida" },
        { status: 400 }
      );
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
        created_by: userId,
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
