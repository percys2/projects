import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function POST(req) {
  try {
    // Get authenticated user and org context
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;

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
      invoiceNumber,
    } = body;

    if (!productId || !qty || !type)
      return NextResponse.json(
        { error: "Missing required fields (productId, qty, type)" },
        { status: 400 }
      );

    // NORMALIZACIÓN - accept both branchId and to_branch/from_branch for compatibility
    let fromBranch = null;
    let toBranch = null;
    let isAdjustment = type === "ajuste";
    let dbType = type;
    let adjustmentQty = Number(qty);

    if (type === "entrada") {
      toBranch = branchId || to_branch;
    }
    if (type === "salida") {
      fromBranch = branchId || from_branch;
    }
    if (type === "transferencia") {
      fromBranch = from_branch;
      toBranch = to_branch;
    }
    if (isAdjustment) {
      const adjustBranch = branchId || from_branch || to_branch;
      if (adjustmentQty >= 0) {
        dbType = "entrada";
        toBranch = adjustBranch;
      } else {
        dbType = "salida";
        fromBranch = adjustBranch;
        adjustmentQty = Math.abs(adjustmentQty);
      }
    }

    if (dbType === "entrada" && !toBranch) {
      return NextResponse.json(
        { error: "Debe seleccionar una sucursal para registrar la entrada" },
        { status: 400 }
      );
    }
    if (dbType === "salida" && !fromBranch) {
      return NextResponse.json(
        { error: "Debe seleccionar una sucursal para registrar la salida" },
        { status: 400 }
      );
    }

    // Build movement reference with invoice number if provided
    let movementReference = notes || null;
    if (invoiceNumber && invoiceNumber.trim()) {
      movementReference = movementReference 
        ? `FAC:${invoiceNumber.trim()} | ${movementReference}`
        : `FAC:${invoiceNumber.trim()}`;
    }

    // INSERTAR EN inventory_movements
    // Para ajustes, usamos dbType (entrada/salida) y adjustmentQty (siempre positivo)
    const { data: movement, error } = await supabase
      .from("inventory_movements")
      .insert({
        org_id: orgId,
        product_id: productId,
        qty: isAdjustment ? adjustmentQty : Number(qty),
        type: dbType,
        cost: cost || null,
        reference: isAdjustment ? `[AJUSTE] ${movementReference || 'Ajuste de inventario'}` : movementReference,
        from_branch: fromBranch,
        to_branch: toBranch,
        created_by: userId,
      })
      .select("*")
      .single();

    if (error) throw error;

    // INSERTAR EN KARDEX para que aparezca en el historial
    const movementTypeMap = {
      entrada: "ENTRY",
      salida: "EXIT",
      transferencia: "TRANSFER",
    };

    // Build reference with invoice number if provided
    let kardexReference = notes || `Movimiento de inventario: ${type}`;
    if (invoiceNumber && invoiceNumber.trim()) {
      kardexReference = `FAC:${invoiceNumber.trim()} | ${kardexReference}`;
    }

    // Para ajustes: mostrar ADJUSTMENT en kardex, con signo segun la cantidad original
    let kardexMovementType;
    let kardexQuantity;
    if (isAdjustment) {
      const originalQty = Number(qty);
      kardexMovementType = originalQty >= 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";
      kardexQuantity = originalQty;
    } else {
      kardexMovementType = movementTypeMap[type] || type.toUpperCase();
      kardexQuantity = type === "salida" ? Number(qty) * -1 : Number(qty);
    }
    
    const kardexData = {
      org_id: orgId,
      product_id: productId,
      movement_type: kardexMovementType,
      quantity: kardexQuantity,
      branch_id: toBranch || fromBranch,
      from_branch: fromBranch,
      to_branch: toBranch,
      cost_unit: cost || 0,
      total: (cost || 0) * Math.abs(Number(qty)),
      reference: isAdjustment ? `[AJUSTE] ${kardexReference}` : kardexReference,
      created_by: userId,
    };

    const { error: kardexError } = await supabase
      .from("kardex")
      .insert(kardexData);

    if (kardexError) {
      console.error("Kardex insert error:", kardexError);
    }

    // ACTUALIZAR current_stock
    // Usamos dbType que ya mapea "ajuste" a "entrada" o "salida"
    if (dbType === "entrada")
      await supabase.rpc("increase_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_branch_id: toBranch,
        p_quantity: isAdjustment ? adjustmentQty : Number(qty),
      });

    if (dbType === "salida")
      await supabase.rpc("decrease_inventory", {
        p_org_id: orgId,
        p_product_id: productId,
        p_branch_id: fromBranch,
        p_quantity: isAdjustment ? adjustmentQty : Number(qty),
      });

    if (dbType === "transferencia")
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
