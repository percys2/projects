import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { validateRequest, deleteSchema, odontPatientSchema, odontPatientUpdateSchema } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: patients, error } = await supabase
      .from("odontology_patients")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ patients: patients || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology patients GET error:", err);
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

    const rl = rateLimit(`odontology:patients:${orgId}`, 50, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(odontPatientSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const insertData = {
      org_id: orgId,
      first_name: validation.data.first_name,
      last_name: validation.data.last_name || null,
      phone: validation.data.phone || null,
      email: validation.data.email || null,
      dob: validation.data.dob || null,
      sex: validation.data.sex || null,
      address: validation.data.address || null,
      emergency_contact_name: validation.data.emergency_contact_name || null,
      emergency_contact_phone: validation.data.emergency_contact_phone || null,
      notes: validation.data.notes || null,
    };

    const { data: patient, error } = await supabaseAdmin
      .from("odontology_patients")
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PATIENT_CREATE,
      resourceType: "odontology_patient",
      resourceId: patient.id,
      metadata: { first_name: patient.first_name, last_name: patient.last_name },
    });

    return NextResponse.json({ patient });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology patients POST error:", err);
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

    const rl = rateLimit(`odontology:patients:${orgId}`, 50, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rl.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(odontPatientUpdateSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Datos inválidos", details: validation.errors }, { status: 400 });
    }

    const updateData = {
      first_name: validation.data.first_name,
      last_name: validation.data.last_name || null,
      phone: validation.data.phone || null,
      email: validation.data.email || null,
      dob: validation.data.dob || null,
      sex: validation.data.sex || null,
      address: validation.data.address || null,
      emergency_contact_name: validation.data.emergency_contact_name || null,
      emergency_contact_phone: validation.data.emergency_contact_phone || null,
      notes: validation.data.notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data: patient, error } = await supabaseAdmin
      .from("odontology_patients")
      .update(updateData)
      .eq("id", validation.data.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PATIENT_UPDATE,
      resourceType: "odontology_patient",
      resourceId: patient.id,
      metadata: { first_name: patient.first_name, last_name: patient.last_name },
    });

    return NextResponse.json({ patient });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology patients PUT error:", err);
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

    const rl = rateLimit(`odontology:patients:${orgId}`, 50, 60000);
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
      .from("odontology_patients")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PATIENT_DELETE,
      resourceType: "odontology_patient",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Odontology patients DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

