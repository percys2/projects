import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { postPaymentToGL } from "@/src/lib/services/journalService";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { paymentSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        clients (first_name, last_name),
        suppliers (name)
      `)
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (error) throw error;

    const paymentsWithNames = (payments || []).map((p) => ({
      ...p,
      client_name: p.clients ? `${p.clients.first_name} ${p.clients.last_name}` : null,
      supplier_name: p.suppliers?.name,
    }));

    return NextResponse.json({ payments: paymentsWithNames });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payments GET error:", err);
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

    const rateLimitResult = rateLimit(`payments:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(paymentSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const paymentData = {
      org_id: orgId,
      date: validation.data.date,
      client_id: validation.data.client_id || null,
      supplier_id: validation.data.supplier_id || null,
      sale_id: validation.data.sale_id || null,
      bill_id: validation.data.bill_id || null,
      amount: validation.data.amount || 0,
      method: validation.data.method || "efectivo",
      direction: validation.data.direction || "out",
      account_id: validation.data.account_id || null,
      notes: validation.data.notes || null,
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;

    if (validation.data.sale_id && validation.data.direction === "in") {
      const { data: sale } = await supabase
        .from("sales")
        .select("total, amount_paid")
        .eq("id", validation.data.sale_id)
        .single();

      if (sale) {
        const newAmountPaid = (sale.amount_paid || 0) + validation.data.amount;
        const newStatus = newAmountPaid >= sale.total ? "paid" : "partial";

        await supabase
          .from("sales")
          .update({ amount_paid: newAmountPaid, status: newStatus })
          .eq("id", validation.data.sale_id);
      }
    }

    if (validation.data.bill_id && validation.data.direction === "out") {
      const { data: bill } = await supabase
        .from("ap_bills")
        .select("total, amount_paid")
        .eq("id", validation.data.bill_id)
        .single();

      if (bill) {
        const newAmountPaid = (bill.amount_paid || 0) + validation.data.amount;
        const newStatus = newAmountPaid >= bill.total ? "paid" : "partial";

        await supabase
          .from("ap_bills")
          .update({ amount_paid: newAmountPaid, status: newStatus })
          .eq("id", validation.data.bill_id);
      }
    }

    try {
      await postPaymentToGL(orgId, payment);
    } catch (glError) {
      console.error("GL posting error (non-blocking):", glError);
    }

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PAYMENT_CREATE,
      resourceType: "payment",
      resourceId: payment.id,
      metadata: { amount: payment.amount, direction: payment.direction },
    });

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payments POST error:", err);
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

    const rateLimitResult = rateLimit(`payments:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const updateData = {
      date: body.date,
      client_id: body.client_id || null,
      supplier_id: body.supplier_id || null,
      amount: body.amount || 0,
      method: body.method || "efectivo",
      direction: body.direction || "out",
      account_id: body.account_id || null,
      notes: body.notes || null,
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PAYMENT_UPDATE,
      resourceType: "payment",
      resourceId: payment.id,
      metadata: { amount: payment.amount, direction: payment.direction },
    });

    return NextResponse.json({ payment });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payments PUT error:", err);
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

    const rateLimitResult = rateLimit(`payments:${orgId}`, 50, 60000);
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

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PAYMENT_DELETE,
      resourceType: "payment",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payments DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
