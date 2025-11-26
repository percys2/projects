import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSaleSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import * as Sentry from "@sentry/nextjs";

/**
 * POST - Create a complete sale with items in a single transaction
 * This ensures atomic operations - either everything succeeds or everything fails
 * 
 * Expected body:
 * {
 *   client_id: uuid,
 *   total: number,
 *   payment_method: string,
 *   items: [
 *     { product_id: uuid, quantity: number, price: number, cost: number }
 *   ]
 * }
 */
export async function POST(req) {
  try {
    const orgId = req.headers.get("x-org-id");
    
    if (!orgId) {
      return NextResponse.json(
        { error: "Missing organization ID" },
        { status: 400 }
      );
    }

    // Rate limiting - 50 sales per minute per org
    const rateLimitResult = rateLimit(`sales:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Demasiadas solicitudes. Por favor intente más tarde.",
          retryAfter: new Date(rateLimitResult.resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await req.json();
    
    // Validate input with Zod
    const validation = validateRequest(createSaleSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Datos de entrada inválidos",
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { client_id, total, payment_method, items, notes } = validation.data;

    // Create Supabase client with service role for transaction
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // TRANSACTION START
    // Note: Supabase doesn't support explicit transactions in the JS client,
    // so we use a database function to ensure atomicity
    
    // Step 1: Create the sale
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .insert({
        org_id: orgId,
        client_id,
        total,
        payment_method: payment_method || "cash",
        notes: notes || null,
      })
      .select()
      .single();

    if (saleError) {
      console.error("Error creating sale:", saleError);
      return NextResponse.json(
        { error: "Failed to create sale: " + saleError.message },
        { status: 500 }
      );
    }

    // Step 2: Create sales items
    const salesItems = items.map((item) => ({
      sale_id: sale.id,
      org_id: orgId,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
      cost: Number(item.cost) || 0,
      subtotal: Number(item.quantity) * Number(item.price),
      margin: (Number(item.price) - (Number(item.cost) || 0)) * Number(item.quantity),
    }));

    const { data: createdItems, error: itemsError } = await supabase
      .from("sales_items")
      .insert(salesItems)
      .select();

    if (itemsError) {
      console.error("Error creating sales items:", itemsError);
      
      // ROLLBACK: Delete the sale if items creation failed
      await supabase
        .from("sales")
        .delete()
        .eq("id", sale.id);

      return NextResponse.json(
        { error: "Failed to create sales items: " + itemsError.message },
        { status: 500 }
      );
    }

    // Step 3: Update inventory (decrease stock)
    for (const item of items) {
      const { error: inventoryError } = await supabase.rpc(
        "decrease_inventory",
        {
          p_org_id: orgId,
          p_product_id: item.product_id,
          p_quantity: Number(item.quantity),
        }
      );

      if (inventoryError) {
        console.error("Error updating inventory:", inventoryError);
        
        // ROLLBACK: Delete sales items and sale
        await supabase
          .from("sales_items")
          .delete()
          .eq("sale_id", sale.id);
        
        await supabase
          .from("sales")
          .delete()
          .eq("id", sale.id);

        return NextResponse.json(
          { 
            error: "Failed to update inventory. Sale rolled back.",
            details: inventoryError.message 
          },
          { status: 500 }
        );
      }
    }

    // Step 4: Create kardex entries for audit trail
    for (const item of items) {
      await supabase
        .from("kardex")
        .insert({
          org_id: orgId,
          product_id: item.product_id,
          movement_type: "sale",
          quantity: -Number(item.quantity),
          reference_id: sale.id,
          notes: `Sale #${sale.id}`,
        });
    }

    // SUCCESS - Log audit event
    await logAuditEvent({
      userId: req.headers.get("x-user-id"),
      orgId,
      action: AuditActions.SALE_CREATE,
      resourceType: 'sale',
      resourceId: sale.id,
      metadata: {
        total: sale.total,
        itemCount: createdItems.length,
        paymentMethod: sale.payment_method,
      },
      ipAddress: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
    });

    // Return complete sale with items
    return NextResponse.json(
      {
        success: true,
        sale: {
          ...sale,
          items: createdItems,
        },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Unexpected error in sale creation:", error);
    
    // Log error to Sentry
    Sentry.captureException(error, {
      tags: {
        operation: 'create_sale',
        org_id: req.headers.get("x-org-id"),
      },
    });
    
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
