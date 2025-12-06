import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { paymentMethodSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data: methods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("org_id", orgId)
      .order("name");

    if (error) throw error;

    return NextResponse.json({ paymentMethods: methods || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("GET payment methods error:", err);
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

    const rateLimitResult = rateLimit(`payment-methods:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const validation = validateRequest(paymentMethodSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const { data: method, error } = await supabase.from("payment_methods").insert({
      org_id: orgId,
      name: validation.data.name,
      code: validation.data.code,
      requires_reference: validation.data.requires_reference || false,
      is_active: validation.data.is_active !== false,
    }).select().single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PAYMENT_METHOD_CREATE,
      resourceType: "payment_method",
      resourceId: method.id,
      metadata: { name: method.name, code: method.code },
    });

    return NextResponse.json({ success: true, paymentMethod: method });
  } catch (err) {
    Sentry.captureException(err);
    console.error("POST payment method error:", err);
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

    const rateLimitResult = rateLimit(`payment-methods:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing payment method ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { data: method, error } = await supabase
      .from("payment_methods")
      .update({
        name: body.name,
        code: body.code,
        requires_reference: body.requires_reference,
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
      action: AuditActions.PAYMENT_METHOD_UPDATE,
      resourceType: "payment_method",
      resourceId: method.id,
      metadata: { name: method.name, code: method.code },
    });

    return NextResponse.json({ success: true, paymentMethod: method });
  } catch (err) {
    Sentry.captureException(err);
    console.error("PUT payment method error:", err);
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

    const rateLimitResult = rateLimit(`payment-methods:${orgId}`, 50, 60000);
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
      .from("payment_methods")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.PAYMENT_METHOD_DELETE,
      resourceType: "payment_method",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("DELETE payment method error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
