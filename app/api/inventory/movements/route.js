import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(req) {
  const supabase = await createServerSupabaseClient();
  const body = await req.json();

  const { orgId, productId, branchId, qty, type } = body;

  if (!orgId || !productId || !branchId || !qty || !type) {
    return NextResponse.json(
      { error: "Missing fields" },
      { status: 400 }
    );
  }

  try {
    // 1. Registrar movimiento
    const { error: movError } = await supabase
      .from("inventory_movements")
      .insert({
        org_id: orgId,
        product_id: productId,
        qty,
        type,
        from_branch: type === "salida" ? branchId : null,
        to_branch: type === "entrada" ? branchId : null,
      });

    if (movError) throw movError;

    // 2. Actualizar inventario
    const delta = type === "salida" ? -qty : qty;

    const { error: invError } = await supabase.rpc("adjust_inventory", {
      p_org: orgId,
      p_product: productId,
      p_branch: branchId,
      p_qty: delta,
    });

    if (invError) throw invError;

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("MOVEMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}