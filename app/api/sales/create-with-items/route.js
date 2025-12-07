import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { createSaleSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import { postSaleToGL } from "@/src/lib/services/journalService";
import { getOrgContextWithBranch } from "@/src/lib/api/getOrgContext";
import * as Sentry from "@sentry/nextjs";

export async function POST(req) {
  try {
    // Securely derive org, user, and branch context from authenticated session
    const context = await getOrgContextWithBranch(req);
    
    if (!context.success) {
      return NextResponse.json(
        { error: context.error },
        { status: context.status }
      );
    }

    const { orgId, userId, branchId } = context;

    // Rate limit
    const rateLimitResult = rateLimit(`sales:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Demasiadas solicitudes. Por favor intente más tarde.",
          retryAfter: new Date(rateLimitResult.resetTime).toISOString(),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimitResult.resetTime - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    const body = await req.json();
    console.log("SALE BODY:", JSON.stringify(body, null, 2));
    const validation = validateRequest(createSaleSchema, body);
    console.log("SALE VALIDATION:", JSON.stringify(validation, null, 2));

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const { client_id, client_name, total, payment_method, items, notes, factura } = validation.data;

    // Defensive guard: ensure items is a valid array
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto en la venta." },
        { status: 400 }
      );
    }

    // Use the admin client for transactional operations
    // Note: org context is already validated via getOrgContextWithBranch
    const supabase = supabaseAdmin;

    // Calculate subtotal and margin from items
    const subtotal = items.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
    const totalCost = items.reduce(
      (sum, item) => sum + Number(item.cost || 0) * Number(item.quantity || 0),
      0
    );
    const margen = subtotal - totalCost;

    // 1. Crear venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        org_id: orgId,
        branch_id: branchId,
        client_id,
        client_name: client_name || null,
        factura: factura || null,
        fecha: new Date().toISOString().split("T")[0],
        subtotal,
        total,
        margen,
        payment_method: payment_method || "cash",
        notes: notes || null,
        user_id: userId || null,
      })
      .select()
      .single();

    if (saleError) {
      return NextResponse.json(
        { error: "Failed to create sale: " + saleError.message },
        { status: 500 }
      );
    }

    // 2. Guardar items de venta (margin is a generated column, don't include it)
    const salesItems = items.map((item) => ({
      sale_id: sale.id,
      org_id: orgId,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
      cost: Number(item.cost) || 0,
      subtotal: Number(item.quantity) * Number(item.price),
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from("sales_items")
      .insert(salesItems)
      .select();

    if (itemsError) {
      await supabase.from("sales").delete().eq("id", sale.id);
      return NextResponse.json(
        { error: "Failed to create sale items: " + itemsError.message },
        { status: 500 }
      );
    }

    // 3. Stock is updated via inventory_movements (no separate inventory table)
    // The current_stock view calculates stock from inventory_movements

    // 4. Registrar movimiento en KARDEX
    for (const item of items) {
      await supabase.from("kardex").insert({
        org_id: orgId,
        product_id: item.product_id,

        movement_type: "SALE",
        quantity: Number(item.quantity) * -1,

        branch_id: branchId,
        from_branch: branchId,
        to_branch: null,

        cost_unit: Number(item.cost) || 0,
        total: Number(item.cost) * Number(item.quantity),

        reference: `Venta #${sale.id}`,
        created_by: userId || null,
      });
    }

    // 5. Registrar MOVIMIENTO en inventory_movements
    // Use type "salida" to match existing convention (current_stock view uses from_branch/to_branch, not type)
    for (const item of items) {
      const { error: movError } = await supabase.from("inventory_movements").insert({
        org_id: orgId,
        product_id: item.product_id,
        type: "salida",
        qty: Number(item.quantity),
        from_branch: branchId,
        to_branch: null,
        cost: item.cost,
        price: item.price,
        reference: `Venta #${sale.id}`,
        created_by: userId,
      });
      if (movError) {
        console.error("Error inserting inventory_movement:", movError);
      }
    }

    // 6. Contabilidad (no bloquea)
    try {
      await postSaleToGL(orgId, sale, createdItems);
    } catch (err) {
      console.error("GL posting error:", err);
    }

    // 7. Auditoría
    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.SALE_CREATE,
      resourceType: "sale",
      resourceId: sale.id,
      metadata: {
        total: sale.total,
        items: createdItems.length,
      },
    });

    return NextResponse.json(
      { success: true, sale: { ...sale, items: createdItems } },
      { status: 201 }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}