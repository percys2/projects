import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();
    const { movements, type, branchId, notes, invoiceNumber } = body;

    if (!movements || !Array.isArray(movements) || movements.length === 0) {
      return NextResponse.json({ error: "Se requiere un array de movimientos" }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: "Se requiere el tipo de movimiento (entrada/salida/ajuste)" }, { status: 400 });
    }

    const results = [];
    const errors = [];

    for (const item of movements) {
      try {
        const { productId, qty, cost } = item;
        if (!productId || qty === undefined || qty === null) {
          errors.push({ productId, error: "Faltan campos requeridos" });
          continue;
        }

        let fromBranch = null, toBranch = null, dbType = type, adjustmentQty = Number(qty);

        if (type === "entrada") toBranch = branchId;
        else if (type === "salida") fromBranch = branchId;
        else if (type === "ajuste") {
          if (adjustmentQty >= 0) { dbType = "entrada"; toBranch = branchId; }
          else { dbType = "salida"; fromBranch = branchId; adjustmentQty = Math.abs(adjustmentQty); }
        }

        let movementReference = notes || null;
        if (invoiceNumber?.trim()) {
          movementReference = movementReference ? `FAC:${invoiceNumber.trim()} | ${movementReference}` : `FAC:${invoiceNumber.trim()}`;
        }

        const { data: movement, error: movError } = await supabase.from("inventory_movements").insert({
          org_id: orgId, product_id: productId, qty: type === "ajuste" ? adjustmentQty : Math.abs(Number(qty)),
          type: dbType, cost: cost || null,
          reference: type === "ajuste" ? `[AJUSTE MASIVO] ${movementReference || 'Ajuste'}` : `[ENTRADA MASIVA] ${movementReference || ''}`,
          from_branch: fromBranch, to_branch: toBranch, created_by: userId,
        }).select("*").single();

        if (movError) { errors.push({ productId, error: movError.message }); continue; }

        const movementTypeMap = { entrada: "ENTRY", salida: "EXIT" };
        let kardexMovementType, kardexQuantity;
        if (type === "ajuste") {
          kardexMovementType = Number(qty) >= 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";
          kardexQuantity = Number(qty);
        } else {
          kardexMovementType = movementTypeMap[dbType] || dbType.toUpperCase();
          kardexQuantity = dbType === "salida" ? Math.abs(Number(qty)) * -1 : Math.abs(Number(qty));
        }

        await supabase.from("kardex").insert({
          org_id: orgId, product_id: productId, movement_type: kardexMovementType, quantity: kardexQuantity,
          branch_id: toBranch || fromBranch, from_branch: fromBranch, to_branch: toBranch,
          cost_unit: cost || 0, total: (cost || 0) * Math.abs(Number(qty)),
          reference: type === "ajuste" ? `[AJUSTE MASIVO] ${notes || 'Ajuste'}` : `[ENTRADA MASIVA] ${notes || ''}`,
          created_by: userId,
        });

        if (dbType === "entrada") {
          await supabase.rpc("increase_inventory", { p_org_id: orgId, p_product_id: productId, p_branch_id: toBranch, p_quantity: type === "ajuste" ? adjustmentQty : Math.abs(Number(qty)) });
        } else if (dbType === "salida") {
          await supabase.rpc("decrease_inventory", { p_org_id: orgId, p_product_id: productId, p_branch_id: fromBranch, p_quantity: type === "ajuste" ? adjustmentQty : Math.abs(Number(qty)) });
        }

        results.push({ productId, success: true, movement });
      } catch (itemError) {
        errors.push({ productId: item.productId, error: itemError.message });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, errors: errors.length, results, errorDetails: errors });
  } catch (err) {
    console.error("BATCH MOVEMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
