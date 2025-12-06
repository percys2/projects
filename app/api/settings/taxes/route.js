import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { taxSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import * as Sentry from "@sentry/nextjs";

export async function GET(request) {
  try {
    const context = await getOrgContext(request);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: taxes, error } = await supabase
      .from("taxes")
      .select("*")
      .eq("org_id", orgId)
      .order("name");

    if (error) throw error;

    return NextResponse.json({ taxes: taxes || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("GET taxes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const context = await getOrgContext(request);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;

    const rateLimitResult = rateLimit(`taxes:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const validation = validateRequest(taxSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    if (validation.data.is_default) {
      await supabase
        .from("taxes")
        .update({ is_default: false })
        .eq("org_id", orgId);
    }

    const { data: tax, error } = await supabase.from("taxes").insert({
      org_id: orgId,
      name: validation.data.name,
      rate: validation.data.rate,
      is_default: validation.data.is_default || false,
      is_active: validation.data.is_active !== false,
    }).select().single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.TAX_CREATE,
      resourceType: "tax",
      resourceId: tax.id,
      metadata: { name: tax.name, rate: tax.rate },
    });

    return NextResponse.json({ success: true, tax });
  } catch (err) {
    Sentry.captureException(err);
    console.error("POST tax error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const context = await getOrgContext(request);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;

    const rateLimitResult = rateLimit(`taxes:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing tax ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    if (body.is_default) {
      await supabase
        .from("taxes")
        .update({ is_default: false })
        .eq("org_id", orgId);
    }

    const { data: tax, error } = await supabase
      .from("taxes")
      .update({
        name: body.name,
        rate: body.rate,
        is_default: body.is_default,
        is_active: body.is_active,
      })
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.TAX_UPDATE,
      resourceType: "tax",
      resourceId: tax.id,
      metadata: { name: tax.name, rate: tax.rate },
    });

    return NextResponse.json({ success: true, tax });
  } catch (err) {
    Sentry.captureException(err);
    console.error("PUT tax error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const context = await getOrgContext(request);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;

    const rateLimitResult = rateLimit(`taxes:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const validation = validateRequest(deleteSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const { error } = await supabase
      .from("taxes")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.TAX_DELETE,
      resourceType: "tax",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("DELETE tax error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
