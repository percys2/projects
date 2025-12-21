import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function POST(req, { params }) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const { id } = await params;

    const { data: transfer, error: fetchError } = await supabase
      .from("inventory_transfers")
      .select(`
        *,
        items:inventory_transfer_items(*)
      `)
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (fetchError || !transfer) {
      return NextResponse.json({ error: "Transfer not found" }, { status: 404 });
    }

    if (transfer.status !== "draft") {
      return NextResponse.json({ error: "Transfer is not in draft status" }, { status: 400 });
    }

    for (const item of transfer.items) {
      await supabase.from("inventory_movements").insert({
        org_id: orgId,
        product_id: item.product_id,
        qty: item.sent_qty,
        type: "transferencia",
        reference: `Transferencia #${transfer.transfer_number || id.slice(0, 8)} - Enviado`,
        from_branch: transfer.from_branch_id,
        to_branch: transfer.to_branch_id,
        created_by: userId,
      });

      await supabase.from("kardex").insert({
        org_id: orgId,
        product_id: item.product_id,
        movement_type: "TRANSFER_OUT",
        quantity: -item.sent_qty,
        branch_id: transfer.from_branch_id,
        from_branch: transfer.from_branch_id,
        to_branch: transfer.to_branch_id,
        reference: `Transferencia #${transfer.transfer_number || id.slice(0, 8)} - Salida`,
        created_by: userId,
      });

      await supabase.rpc("decrease_inventory", {
        p_org_id: orgId,
        p_product_id: item.product_id,
        p_branch_id: transfer.from_branch_id,
        p_quantity: item.sent_qty,
      });
    }

    const { error: updateError } = await supabase
      .from("inventory_transfers")
      .update({
        status: "sent",
        sent_by: userId,
        sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending transfer:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}