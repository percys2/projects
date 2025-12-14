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

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("org_id", orgId)
      .order("code", { ascending: true });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ accounts: [] });
      }
      throw error;
    }

    return NextResponse.json({ accounts: accounts || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Accounts GET error:", err);
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

    const rateLimitResult = rateLimit(`accounts:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.code || !body.name || !body.type) {
      return NextResponse.json(
        { error: "Código, nombre y tipo son requeridos" },
        { status: 400 }
      );
    }

    const accountData = {
      org_id: orgId,
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype || null,
      parent_id: body.parent_id || null,
      is_active: body.is_active !== false,
    };

    const { data: account, error } = await supabase
      .from("accounts")
      .insert(accountData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ACCOUNT_CREATE || "account_create",
      resourceType: "account",
      resourceId: account.id,
      metadata: { code: account.code, name: account.name },
    });

    return NextResponse.json({ account }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Accounts POST error:", err);
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

    const rateLimitResult = rateLimit(`accounts:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    const updateData = {
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype || null,
      parent_id: body.parent_id || null,
      is_active: body.is_active,
    };

    const { data: account, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ACCOUNT_UPDATE || "account_update",
      resourceType: "account",
      resourceId: account.id,
      metadata: { code: account.code, name: account.name },
    });

    return NextResponse.json({ account });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Accounts PUT error:", err);
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

    const rateLimitResult = rateLimit(`accounts:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const supabase = supabaseAdmin;
    const body = await req.json();

    const validation = validateRequest(deleteSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ACCOUNT_DELETE || "account_delete",
      resourceType: "account",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Accounts DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
