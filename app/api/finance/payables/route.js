import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
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

    const { data: payables, error } = await supabase
      .from("ap_payables")
      .select(`
        id,
        supplier_id,
        reference,
        description,
        date,
        due_date,
        total,
        amount_paid,
        status,
        notes,
        created_at,
        suppliers (id, name, contact_name, email, phone)
      `)
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ payables: [] });
      }
      throw error;
    }

    const formattedPayables = (payables || []).map(p => ({
      ...p,
      supplier_name: p.suppliers?.name || "Sin proveedor",
    }));

    return NextResponse.json({ payables: formattedPayables });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payables GET error:", err);
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

    const rateLimitResult = rateLimit(`payables:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const supabase = supabaseAdmin;

    const total = parseFloat(body.total) || 0;
    const amount_paid = parseFloat(body.amount_paid) || 0;
    let status = "pending";
    if (amount_paid >= total && total > 0) {
      status = "paid";
    } else if (amount_paid > 0) {
      status = "partial";
    }

    const { data: payable, error } = await supabase
      .from("ap_payables")
      .insert({
        org_id: orgId,
        supplier_id: body.supplier_id || null,
        reference: body.reference || null,
        description: body.description || null,
        date: body.date || new Date().toISOString().split("T")[0],
        due_date: body.due_date || null,
        total,
        amount_paid,
        status,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_CREATE,
      resourceType: "ap_payable",
      resourceId: payable.id,
      metadata: { reference: payable.reference, total: payable.total },
    });

    return NextResponse.json({ payable, success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payables POST error:", err);
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

    const rateLimitResult = rateLimit(`payables:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing payable ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const total = parseFloat(body.total) || 0;
    const amount_paid = parseFloat(body.amount_paid) || 0;
    let status = "pending";
    if (amount_paid >= total && total > 0) {
      status = "paid";
    } else if (amount_paid > 0) {
      status = "partial";
    }

    const { data: payable, error } = await supabase
      .from("ap_payables")
      .update({
        supplier_id: body.supplier_id || null,
        reference: body.reference || null,
        description: body.description || null,
        date: body.date,
        due_date: body.due_date || null,
        total,
        amount_paid,
        status,
        notes: body.notes || null,
      })
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_UPDATE,
      resourceType: "ap_payable",
      resourceId: payable.id,
      metadata: { reference: payable.reference, total: payable.total },
    });

    return NextResponse.json({ payable, success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payables PUT error:", err);
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

    const rateLimitResult = rateLimit(`payables:${orgId}`, 50, 60000);
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
      .from("ap_payables")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.AP_BILL_DELETE,
      resourceType: "ap_payable",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payables DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
