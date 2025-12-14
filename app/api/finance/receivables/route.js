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

    // First try ar_receivables table
    const { data: arData, error: arError } = await supabase
      .from("ar_receivables")
      .select(`
        *,
        clients (id, first_name, last_name, phone, animal_type, city)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (!arError && arData) {
      const receivables = arData.map((r) => ({
        ...r,
        client_name: r.clients 
          ? `${r.clients.first_name || ""} ${r.clients.last_name || ""}`.trim() 
          : "Cliente",
        client_phone: r.clients?.phone || "",
        client_type: r.clients?.animal_type || "",
        client_city: r.clients?.city || "",
      }));
      return NextResponse.json({ receivables });
    }

    // Fallback to sales table if ar_receivables doesn't exist
    const { data: salesData, error: salesError } = await supabase
      .from("sales")
      .select(`
        id,
        factura,
        fecha,
        total,
        amount_paid,
        status,
        due_date,
        client_id,
        clients (id, first_name, last_name, phone)
      `)
      .eq("org_id", orgId)
      .in("status", ["unpaid", "partial", "pending"])
      .order("fecha", { ascending: false });

    if (salesError) {
      console.error("Sales query error:", salesError);
      return NextResponse.json({ receivables: [] });
    }

    const receivables = (salesData || []).map((s) => ({
      ...s,
      client_name: s.clients 
        ? `${s.clients.first_name || ""} ${s.clients.last_name || ""}`.trim() 
        : "Cliente general",
    }));

    return NextResponse.json({ receivables });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Receivables GET error:", err);
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

    const rateLimitResult = rateLimit(`receivables:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const supabase = supabaseAdmin;

    if (!body.client_id) {
      return NextResponse.json({ error: "Debe seleccionar un cliente" }, { status: 400 });
    }

    if (!body.total || parseFloat(body.total) <= 0) {
      return NextResponse.json({ error: "El total debe ser mayor a 0" }, { status: 400 });
    }

    const total = parseFloat(body.total) || 0;
    const amount_paid = parseFloat(body.amount_paid) || 0;
    let status = "pending";
    if (amount_paid >= total && total > 0) {
      status = "paid";
    } else if (amount_paid > 0) {
      status = "partial";
    }

    const { data, error } = await supabase
      .from("ar_receivables")
      .insert({
        org_id: orgId,
        client_id: body.client_id,
        factura: body.factura || `REC-${Date.now()}`,
        total,
        amount_paid,
        due_date: body.due_date || null,
        status,
        fecha: body.fecha || new Date().toISOString().split("T")[0],
        notes: body.notes || null,
      })
      .select(`
        *,
        clients (id, first_name, last_name, phone)
      `)
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.RECEIVABLE_CREATE || "receivable_create",
      resourceType: "ar_receivable",
      resourceId: data.id,
      metadata: { 
        factura: data.factura, 
        total: data.total,
        client_id: data.client_id 
      },
    });

    const receivable = {
      ...data,
      client_name: data.clients 
        ? `${data.clients.first_name || ""} ${data.clients.last_name || ""}`.trim() 
        : "Cliente",
    };

    return NextResponse.json({ receivable }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Receivables POST error:", err);
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

    const rateLimitResult = rateLimit(`receivables:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "ID de cuenta por cobrar requerido" }, { status: 400 });
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

    const { data, error } = await supabase
      .from("ar_receivables")
      .update({
        client_id: body.client_id,
        factura: body.factura,
        total,
        amount_paid,
        due_date: body.due_date,
        status,
        notes: body.notes || null,
      })
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select(`
        *,
        clients (id, first_name, last_name, phone)
      `)
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.RECEIVABLE_UPDATE || "receivable_update",
      resourceType: "ar_receivable",
      resourceId: data.id,
      metadata: { factura: data.factura, total: data.total },
    });

    const receivable = {
      ...data,
      client_name: data.clients 
        ? `${data.clients.first_name || ""} ${data.clients.last_name || ""}`.trim() 
        : "Cliente",
    };

    return NextResponse.json({ receivable });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Receivables PUT error:", err);
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

    const rateLimitResult = rateLimit(`receivables:${orgId}`, 50, 60000);
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
      .from("ar_receivables")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.RECEIVABLE_DELETE || "receivable_delete",
      resourceType: "ar_receivable",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Receivables DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
