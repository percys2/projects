import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSaleSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import { postSaleToGL } from "@/src/lib/services/journalService";
import * as Sentry from "@sentry/nextjs";

export async function POST(req) {
  try {
    const orgId = req.headers.get("x-org-id");
    const userId = req.headers.get("x-user-id");
    const branchId = req.headers.get("x-branch-id"); // POS SELECTS THIS

    if (!orgId || !branchId) {
      return NextResponse.json(
        { error: "Missing org ID or branch ID" },
        { status: 400 }
      );
    }

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
    const validation = validateRequest(createSaleSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const { client_id, total, payment_method, items, notes } = validation.data;

    // Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Crear venta
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        org_id: orgId,
        branch_id: branchId,
        client_id,
        total,
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

    // 2. Guardar items de venta
    const salesItems = items.map((item) => ({
      sale_id: sale.id,
      org_id: orgId,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
      cost: Number(item.cost) || 0,
      subtotal: Number(item.quantity) * Number(item.price),
      margin:
        (Number(item.price) - Number(item.cost || 0)) *
        Number(item.quantity),
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

    // 3. Actualizar inventario mediante RPC
    for (const item of items) {
      const { error } = await supabase.rpc("decrease_inventory", {
        p_org_id: orgId,
        p_product_id: item.product_id,
        p_quantity: Number(item.quantity),
        p_branch_id: branchId,
      });

      if (error) {
        // rollback
        await supabase.from("sales_items").delete().eq("sale_id", sale.id);
        await supabase.from("sales").delete().eq("id", sale.id);

        return NextResponse.json(
          {
            error: "Failed to update stock. Sale rolled back.",
            details: error.message,
          },
          { status: 500 }
        );
      }
    }

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
    for (const item of items) {
      await supabase.from("inventory_movements").insert({
        org_id: orgId,
        product_id: item.product_id,
        type: "SALE",
        qty: Number(item.quantity),
        from_branch: branchId,
        to_branch: null,
        cost: item.cost,
        price: item.price,
        reference: `Venta #${sale.id}`,
        created_by: userId,
      });
    }

    // 6. Si es venta a credito, registrar transaccion de credito
    if (payment_method === "credit" && client_id) {
      const { error: creditError } = await supabase.rpc("register_credit_purchase", {
        p_org_id: orgId,
        p_client_id: client_id,
        p_branch_id: branchId,
        p_sale_id: sale.id,
        p_amount: total,
        p_created_by: userId || null,
      });

      if (creditError) {
        await supabase.from("sales_items").delete().eq("sale_id", sale.id);
        await supabase.from("sales").delete().eq("id", sale.id);
        return NextResponse.json(
          { error: "Error al registrar credito: " + creditError.message },
          { status: 400 }
        );
      }
    }

    // 7. Contabilidad (no bloquea)
    try {
      await postSaleToGL(orgId, sale, createdItems);
    } catch (err) {
      console.error("GL posting error:", err);
    }

    // 8. Auditoria
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
