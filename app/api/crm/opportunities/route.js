import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { opportunitySchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data, error } = await supabase
      .from("crm_opportunities")
      .select(`
        *,
        client:clients(id, first_name, last_name, phone),
        stage:crm_stages(id, name, code, color, probability, sort_order)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = data.map((opp) => ({
      ...opp,
      client_id: opp.client?.id || null,
      client_name: `${opp.client?.first_name || ""} ${opp.client?.last_name || ""}`.trim(),
      client_phone: opp.client?.phone || null,
      stage_id: opp.stage?.id ?? opp.stage_id,
      stage_name: opp.stage?.name || null,
      stage_color: opp.stage?.color || "gray",
      stage_order: opp.stage?.sort_order || 0,
      stage_code: opp.stage?.code || null,
    }));

    return NextResponse.json({ opportunities: formatted });
  } catch (err) {
    Sentry.captureException(err);
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

    const rateLimitResult = rateLimit(`crm:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(opportunitySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const { data: defaultStage } = await supabase
      .from("crm_stages")
      .select("id")
      .eq("org_id", orgId)
      .eq("is_active", true)
      .order("sort_order")
      .limit(1)
      .single();

    if (!validation.data.stage_id && !defaultStage) {
      return NextResponse.json({ error: "No hay etapas configuradas" }, { status: 400 });
    }

    const insertData = {
      org_id: orgId,
      title: validation.data.title,
      client_id: validation.data.client_id || null,
      amount: validation.data.amount || 0,
      stage_id: validation.data.stage_id || defaultStage?.id,
      status: validation.data.status || "open",
      expected_close_date: validation.data.expected_close_date || null,
      source: validation.data.source || null,
      notes: validation.data.notes || null,
    };

    const { data, error } = await supabase
      .from("crm_opportunities")
      .insert(insertData)
      .select(`*, client:clients(id, first_name, last_name, phone), stage:crm_stages(id, name, code, color, probability, sort_order)`)
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.OPPORTUNITY_CREATE,
      resourceType: "crm_opportunity",
      resourceId: data.id,
      metadata: { title: data.title, amount: data.amount },
    });

    return NextResponse.json({ opportunity: data });
  } catch (err) {
    Sentry.captureException(err);
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

    const rateLimitResult = rateLimit(`crm:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing opportunity ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { data, error } = await supabase
      .from("crm_opportunities")
      .update({
        title: body.title,
        client_id: body.client_id || null,
        amount: body.amount,
        stage_id: body.stage_id,
        status: body.status,
        expected_close_date: body.expected_close_date,
        source: body.source,
        notes: body.notes,
        lost_reason: body.lost_reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select(`*, client:clients(id, first_name, last_name, phone), stage:crm_stages(id, name, code, color, probability, sort_order)`)
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.OPPORTUNITY_UPDATE,
      resourceType: "crm_opportunity",
      resourceId: data.id,
      metadata: { title: data.title, amount: data.amount },
    });

    return NextResponse.json({ opportunity: data });
  } catch (err) {
    Sentry.captureException(err);
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

    const rateLimitResult = rateLimit(`crm:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing opportunity ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const { error } = await supabase
      .from("crm_opportunities")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.OPPORTUNITY_DELETE,
      resourceType: "crm_opportunity",
      resourceId: id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
