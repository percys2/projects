import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { supplierSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data: suppliers, error } = await supabase
      .from("suppliers")
      .select("*")
      .eq("org_id", orgId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ suppliers: suppliers || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Suppliers GET error:", err);
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

    const rateLimitResult = rateLimit(`suppliers:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(supplierSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const supplierData = {
      org_id: orgId,
      name: validation.data.name,
      tax_id: validation.data.tax_id || null,
      phone: validation.data.phone || null,
      email: validation.data.email || null,
      address: validation.data.address || null,
    };

    const { data: supplier, error } = await supabase
      .from("suppliers")
      .insert(supplierData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.SUPPLIER_CREATE,
      resourceType: "supplier",
      resourceId: supplier.id,
      metadata: { name: supplier.name },
    });

    return NextResponse.json({ supplier }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Suppliers POST error:", err);
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

    const rateLimitResult = rateLimit(`suppliers:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing supplier ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const updateData = {
      name: body.name,
      tax_id: body.tax_id || null,
      phone: body.phone || null,
      email: body.email || null,
      address: body.address || null,
    };

    const { data: supplier, error } = await supabase
      .from("suppliers")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.SUPPLIER_UPDATE,
      resourceType: "supplier",
      resourceId: supplier.id,
      metadata: { name: supplier.name },
    });

    return NextResponse.json({ supplier });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Suppliers PUT error:", err);
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

    const rateLimitResult = rateLimit(`suppliers:${orgId}`, 50, 60000);
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
      .from("suppliers")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.SUPPLIER_DELETE,
      resourceType: "supplier",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Suppliers DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
