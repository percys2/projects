import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { validateRequest, deleteSchema, odontAppointmentSchema, odontAppointmentUpdateSchema } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;

    const { data: appointments, error } = await supabaseAdmin
      .from("odontology_appointments")
      .select("*, patient:odontology_patients(id, first_name, last_name, phone, email)")
      .eq("org_id", orgId)
      .order("scheduled_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ appointments: appointments || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology appointments GET error:", err);
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

    const rl = rateLimit(`odontology:appointments:${orgId}`, 80, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(odontAppointmentSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const insertData = {
      org_id: orgId,
      patient_id: validation.data.patient_id,
      dentist_name: validation.data.dentist_name || null,
      scheduled_at: validation.data.scheduled_at,
      duration_minutes: validation.data.duration_minutes ?? 30,
      status: validation.data.status || "scheduled",
      reason: validation.data.reason || null,
      notes: validation.data.notes || null,
    };

    const { data: appointment, error } = await supabaseAdmin
      .from("odontology_appointments")
      .insert(insertData)
      .select("*, patient:odontology_patients(id, first_name, last_name, phone, email)")
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.APPOINTMENT_CREATE,
      resourceType: "odontology_appointment",
      resourceId: appointment.id,
      metadata: { patient_id: appointment.patient_id, scheduled_at: appointment.scheduled_at, status: appointment.status },
    });

    return NextResponse.json({ appointment });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology appointments POST error:", err);
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

    const rl = rateLimit(`odontology:appointments:${orgId}`, 80, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(odontAppointmentUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const updateData = {
      patient_id: validation.data.patient_id,
      dentist_name: validation.data.dentist_name || null,
      scheduled_at: validation.data.scheduled_at,
      duration_minutes: validation.data.duration_minutes ?? 30,
      status: validation.data.status || "scheduled",
      reason: validation.data.reason || null,
      notes: validation.data.notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data: appointment, error } = await supabaseAdmin
      .from("odontology_appointments")
      .update(updateData)
      .eq("id", validation.data.id)
      .eq("org_id", orgId)
      .select("*, patient:odontology_patients(id, first_name, last_name, phone, email)")
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.APPOINTMENT_UPDATE,
      resourceType: "odontology_appointment",
      resourceId: appointment.id,
      metadata: { patient_id: appointment.patient_id, scheduled_at: appointment.scheduled_at, status: appointment.status },
    });

    return NextResponse.json({ appointment });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology appointments PUT error:", err);
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

    const rl = rateLimit(`odontology:appointments:${orgId}`, 80, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(deleteSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("odontology_appointments")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.APPOINTMENT_DELETE,
      resourceType: "odontology_appointment",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology appointments DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

