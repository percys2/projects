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
      .from("inventory_purchases")
      .select(`
        *,
        branch:branches(name),
        supplier:suppliers(name),
        items:inventory_purchase_items(
          *,
          product:products(name, sku, category)
        )
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data: purchases, error } = await query;

    if (error) throw error;

    return NextResponse.json({ purchases: purchases || [] });
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);
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
    const { branchId, supplierId, supplierInvoice, notes, items } = body;

    if (!branchId) {
      return NextResponse.json({ error: "Debe seleccionar una sucursal" }, { status: 400 });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Debe agregar al menos un producto" }, { status: 400 });
    }

    const purchaseNumber = `PUR-${Date.now()}`;

    const { data: purchase, error: purchaseError } = await supabase
      .from("inventory_purchases")
      .insert({
        org_id: orgId,
        branch_id: branchId,
        supplier_id: supplierId || null,
        supplier_invoice: supplierInvoice || null,
        purchase_number: purchaseNumber,
        notes: notes || null,
        status: "completed",
        total_items: items.length,
        total_units: items.reduce((sum, i) => sum + (i.qty || i.quantity || 0), 0),
        total_cost: items.reduce((sum, i) => sum + ((i.qty || i.quantity || 0) * (i.cost || i.unitCost || 0)), 0),
        created_by: userId,
      })
      .select("*")
      .single();

    if (purchaseError) throw purchaseError;

    const purchaseItems = items.map((item) => ({
      org_id: orgId,
      purchase_id: purchase.id,
      product_id: item.productId || item.product_id,
      quantity: item.qty || item.quantity || 0,
      unit_cost: item.cost || item.unitCost || 0,
      total_cost: (item.qty || item.quantity || 0) * (item.cost || item.unitCost || 0),
      expiration_date: item.expirationDate || item.expiration_date || null,
      lot_number: item.lotNumber || item.lot_number || null,
    }));

    const { error: itemsError } = await supabase
      .from("inventory_purchase_items")
      .insert(purchaseItems);

    if (itemsError) {
      console.error("Purchase items insert error:", itemsError);
    }

    for (const item of items) {
      const productId = item.productId || item.product_id;
      const qty = item.qty || item.quantity || 0;
      const cost = item.cost || item.unitCost || 0;

      const { data: movement, error: movementError } = await supabase
        .from("inventory_movements")
        .insert({
          org_id: orgId,
          product_id: productId,
          qty: qty,
          type: "entrada",
          cost: cost,
          reference: `Recepcion de compra: ${purchaseNumber}`,
          to_branch: branchId,
          created_by: userId,
        })
        .select("*")
        .single();

      if (movementError) {
        console.error("Movement insert error:", movementError);
      }

      const kardexData = {
        org_id: orgId,
        product_id: productId,
        movement_type: "PURCHASE",
        quantity: qty,
        branch_id: branchId,
        to_branch: branchId,
        cost_unit: cost,
        total: cost * qty,
        reference: `Recepcion de compra: ${purchaseNumber}`,
        created_by: userId,
      };

      const { error: kardexError } = await supabase
        .from("kardex")
        .insert(kardexData);

      if (kardexError) {
        console.error("Kardex insert error:", kardexError);
      }

      await supabase.rpc("increase_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_branch_id: branchId,
        p_quantity: qty,
      });
    }

    return NextResponse.json({ 
      success: true, 
      purchase,
      message: "Compra registrada exitosamente"
    });

  } catch (err) {
    console.error("POST PURCHASE ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
