import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    const { productId, branchId, qty, type, cost, price, expiresAt, lot, notes, from_branch, to_branch } = body;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!productId || !qty || !type) {
      return NextResponse.json({ error: "Missing required fields (productId, qty, type)" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = org.id;

    const movementData = {
      org_id: orgId,
      product_id: productId,
      qty: Number(qty),
      movement_type: type,
      cost: cost || null,
      price: price || null,
      expires_at: expiresAt || null,
      lot: lot || null,
      reference: notes || null,
    };

    if (type === "entrada") {
      movementData.to_branch = branchId || null;
    } else if (type === "salida") {
      movementData.from_branch = branchId || null;
    } else if (type === "transferencia" || type === "traslado") {
      movementData.movement_type = "transferencia";
      movementData.from_branch = from_branch || branchId || null;
      movementData.to_branch = to_branch || null;
    } else if (type === "ajuste") {
      movementData.from_branch = branchId || null;
      movementData.to_branch = branchId || null;
    }

    const { data: movement, error: movError } = await supabase
      .from("inventory_movements")
      .insert(movementData)
      .select()
      .single();

    if (movError) throw movError;

    if (branchId && (type === "entrada" || type === "salida" || type === "ajuste")) {
      const delta = type === "salida" ? -Number(qty) : Number(qty);

      const { error: invError } = await supabase
        .from("inventory")
        .update({ quantity: supabase.raw(`quantity + ${delta}`) })
        .eq("org_id", orgId)
        .eq("product_id", productId)
        .eq("branch_id", branchId);

      if (invError) {
        const { error: upsertError } = await supabase
          .from("inventory")
          .upsert({
            org_id: orgId,
            product_id: productId,
            branch_id: branchId,
            quantity: type === "salida" ? 0 : Number(qty),
            cost: cost || 0,
            price: price || 0,
          }, { onConflict: "org_id,product_id,branch_id" });

        if (upsertError) {
          console.error("Inventory upsert error:", upsertError);
        }
      }
    }

    if (type === "transferencia" || type === "traslado") {
      if (from_branch) {
        await supabase
          .from("inventory")
          .update({ quantity: supabase.raw(`quantity - ${Number(qty)}`) })
          .eq("org_id", orgId)
          .eq("product_id", productId)
          .eq("branch_id", from_branch);
      }
      if (to_branch) {
        const { error: toError } = await supabase
          .from("inventory")
          .update({ quantity: supabase.raw(`quantity + ${Number(qty)}`) })
          .eq("org_id", orgId)
          .eq("product_id", productId)
          .eq("branch_id", to_branch);

        if (toError) {
          await supabase
            .from("inventory")
            .insert({
              org_id: orgId,
              product_id: productId,
              branch_id: to_branch,
              quantity: Number(qty),
              cost: cost || 0,
              price: price || 0,
            });
        }
      }
    }

    return NextResponse.json({ success: true, movement });

  } catch (err) {
    console.error("MOVEMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

