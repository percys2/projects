import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { postAPBillToGL, postPaymentToGL } from "@/src/lib/services/journalService";
import { deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import * as Sentry from "@sentry/nextjs";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: bills, error } = await supabase
      .from("ap_bills")
      .select(`
        *,
        suppliers (id, name, phone, email)
      `)
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ bills: [] });
      }
      throw error;
    }

    const billsWithSupplier = (bills || []).map((b) => ({
      ...b,
      supplier_name: b.suppliers?.name || "Sin proveedor",
    }));

    return NextResponse.json({ bills: billsWithSupplier });
  } catch (err) {
    Sentry.captureException(err);
    console.error("AP Bills GET error:", err);
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

    const rateLimitResult = rateLimit(`ap-bills:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const supabase = supabaseAdmin;

    if (!body.date) {
      return NextResponse.json({ error: "La fecha es requerida" }, { status: 400 });
    }

    const total = parseFloat(body.total) || 0;

    // Si is_paid es true o no se especifica (por defecto pagado), marcar como pagado
    const isPaid = body.is_paid !== false;
    
    const billData = {
      org_id: orgId,
      supplier_id: body.supplier_id || null,
      date: body.date,
      due_date: body.due_date || null,
      reference: body.reference || null,
      total,
      amount_paid: isPaid ? total : 0,
      status: isPaid ? "paid" : "open",
      notes: body.notes || null,
    };

    const { data: bill, error: billError } = await supabase
      .from("ap_bills")
      .insert(billData)
      .select()
      .single();

    if (billError) throw billError;

    let itemsData = [];
    if (body.items && body.items.length > 0) {
      itemsData = body.items.map((item) => ({
        org_id: orgId,
        bill_id: bill.id,
        account_id: item.account_id || null,
        description: item.description || null,
        amount: parseFloat(item.amount) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("ap_bill_items")
        .insert(itemsData);

      if (itemsError) {
        Sentry.captureException(itemsError);
        console.error("AP Bill Items insert error:", itemsError);
      }
    }

    try {
      const glItems = itemsData.length > 0 ? itemsData : [{ amount: bill.total, description: bill.notes || "Gasto" }];
      await postAPBillToGL(orgId, bill, glItems);
    } catch (glError) {
      console.error("GL posting error (non-blocking):", glError);
    }

    // Si el gasto está pagado, crear automáticamente el registro de pago
    if (isPaid && total > 0) {
      try {
        const paymentData = {
          org_id: orgId,
          date: body.date,
          supplier_id: body.supplier_id || null,
          bill_id: bill.id,
          amount: total,
          method: body.payment_method || "efectivo",
          direction: "out",
          notes: `Pago automático - ${bill.reference || bill.notes || "Gasto"}`,
        };

        const { data: payment, error: paymentError } = await supabase
          .from("payments")
          .insert(paymentData)
          .select()
          .single();

        if (paymentError) {
          console.error("Auto-payment creation error:", paymentError);
        } else {
          try {
            await postPaymentToGL(orgId, payment);
          } catch (glError) {
            console.error("Payment GL posting error (non-blocking):", glError);
          }
        }
      } catch (paymentErr) {
        console.error("Auto-payment error (non-blocking):", paymentErr);
      }
    }

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_CREATE,
      resourceType: "ap_bill",
      resourceId: bill.id,
      metadata: { reference: bill.reference, total: bill.total, isPaid },
    });

    return NextResponse.json({ bill }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("AP Bills POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;

    const rateLimitResult = rateLimit(`ap-bills:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing bill ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const updateData = {
      supplier_id: body.supplier_id || null,
      date: body.date,
      due_date: body.due_date || null,
      reference: body.reference || null,
      total: parseFloat(body.total) || 0,
      notes: body.notes || null,
    };

    const { data: bill, error } = await supabase
      .from("ap_bills")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    if (body.items) {
      await supabase
        .from("ap_bill_items")
        .delete()
        .eq("bill_id", body.id);

      if (body.items.length > 0) {
        const itemsData = body.items.map((item) => ({
          org_id: orgId,
          bill_id: body.id,
          account_id: item.account_id || null,
          description: item.description || null,
          amount: parseFloat(item.amount) || 0,
        }));

        await supabase.from("ap_bill_items").insert(itemsData);
      }
    }

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_UPDATE,
      resourceType: "ap_bill",
      resourceId: bill.id,
      metadata: { reference: bill.reference, total: bill.total },
    });

    return NextResponse.json({ bill });
  } catch (err) {
    Sentry.captureException(err);
    console.error("AP Bills PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;

    const rateLimitResult = rateLimit(`ap-bills:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(deleteSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    // Primero eliminar los pagos asociados a este gasto
    await supabase
      .from("payments")
      .delete()
      .eq("bill_id", validation.data.id)
      .eq("org_id", orgId);

    // Luego eliminar los items del gasto
    await supabase
      .from("ap_bill_items")
      .delete()
      .eq("bill_id", validation.data.id);

    // Finalmente eliminar el gasto
    const { error } = await supabase
      .from("ap_bills")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_DELETE,
      resourceType: "ap_bill",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("AP Bills DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
