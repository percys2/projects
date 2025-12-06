import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { clientSchema, clientUpdateSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", orgId)
      .order("first_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(clients || []);
  } catch (err) {
    Sentry.captureException(err);
    console.error("Clients GET error:", err);
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

    const rateLimitResult = rateLimit(`clients:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(clientSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const clientData = {
      org_id: orgId,
      first_name: validation.data.first_name,
      last_name: validation.data.last_name,
      phone: validation.data.phone,
      address: validation.data.address,
      city: validation.data.city,
      municipio: validation.data.municipio,
      animal_type: validation.data.animal_type,
      sales_stage: validation.data.sales_stage || "prospecto",
      latitude: validation.data.latitude || null,
      longitude: validation.data.longitude || null,
    };

    const { data: client, error } = await supabase
      .from("clients")
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.CLIENT_CREATE,
      resourceType: "client",
      resourceId: client.id,
      metadata: { first_name: client.first_name, last_name: client.last_name },
    });

    return NextResponse.json(client);
  } catch (err) {
    Sentry.captureException(err);
    console.error("Clients POST error:", err);
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

    const rateLimitResult = rateLimit(`clients:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(clientUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const updateData = {
      first_name: validation.data.first_name,
      last_name: validation.data.last_name,
      phone: validation.data.phone,
      address: validation.data.address,
      city: validation.data.city,
      municipio: validation.data.municipio,
      animal_type: validation.data.animal_type,
      sales_stage: validation.data.sales_stage,
      latitude: validation.data.latitude || null,
      longitude: validation.data.longitude || null,
    };

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", validation.data.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.CLIENT_UPDATE,
      resourceType: "client",
      resourceId: client.id,
      metadata: { first_name: client.first_name, last_name: client.last_name },
    });

    return NextResponse.json(client);
  } catch (err) {
    Sentry.captureException(err);
    console.error("Clients PUT error:", err);
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

    const rateLimitResult = rateLimit(`clients:${orgId}`, 50, 60000);
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
      .from("clients")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.CLIENT_DELETE,
      resourceType: "client",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Clients DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
