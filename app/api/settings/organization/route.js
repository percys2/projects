import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
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

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", orgId)
      .single();

    if (error) throw error;

    return NextResponse.json({ organization: org });
  } catch (err) {
    Sentry.captureException(err);
    console.error("GET organization error:", err);
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

    const rateLimitResult = rateLimit(`organization:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await request.json();
    const supabase = supabaseAdmin;

    const { data: org, error } = await supabase
      .from("organizations")
      .update({
        name: body.name,
        legal_name: body.legal_name,
        tax_id: body.tax_id,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        country: body.country,
        currency: body.currency,
        logo_url: body.logo_url,
      })
      .eq("id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.SETTINGS_UPDATE,
      resourceType: "organization",
      resourceId: orgId,
      metadata: { name: org.name },
    });

    return NextResponse.json({ success: true, organization: org });
  } catch (err) {
    Sentry.captureException(err);
    console.error("PUT organization error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
