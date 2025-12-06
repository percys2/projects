import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { activitySchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunity_id");
    const clientId = searchParams.get("client_id");

    let query = supabase
      .from("crm_activities")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (opportunityId) query = query.eq("opportunity_id", opportunityId);
    if (clientId) query = query.eq("client_id", clientId);

    const { data: activities, error } = await query;
    if (error) throw error;

    return NextResponse.json({ activities: activities || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("CRM activities GET error:", err);
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

    const rateLimitResult = rateLimit(`crm-activities:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(activitySchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const activityData = {
      org_id: orgId,
      client_id: validation.data.client_id || null,
      opportunity_id: validation.data.opportunity_id || null,
      type: validation.data.type,
      subject: validation.data.subject,
      description: validation.data.description || null,
      due_date: validation.data.due_date || null,
      completed_at: validation.data.completed_at || null,
      outcome: validation.data.outcome || null,
      next_step: validation.data.next_step || null,
    };

    const { data: activity, error } = await supabase
      .from("crm_activities")
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ACTIVITY_CREATE,
      resourceType: "crm_activity",
      resourceId: activity.id,
      metadata: { type: activity.type, subject: activity.subject },
    });

    return NextResponse.json({ activity });
  } catch (err) {
    Sentry.captureException(err);
    console.error("CRM activities POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
