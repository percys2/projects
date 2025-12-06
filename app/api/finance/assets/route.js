import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { assetSchema, deleteSchema, validateRequest } from "@/src/lib/validation/schemas";
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

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("org_id", orgId)
      .order("acquisition_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ assets: assets || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Assets GET error:", err);
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

    const rateLimitResult = rateLimit(`assets:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(assetSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const assetData = {
      org_id: orgId,
      name: validation.data.name,
      category: validation.data.category || null,
      acquisition_date: validation.data.acquisition_date,
      acquisition_cost: validation.data.acquisition_cost || 0,
      useful_life_months: validation.data.useful_life_months || 60,
      salvage_value: validation.data.salvage_value || 0,
      depreciation_method: validation.data.depreciation_method || "straight_line",
      account_asset_id: validation.data.account_asset_id || null,
      status: validation.data.status || "active",
    };

    const { data: asset, error } = await supabase
      .from("assets")
      .insert(assetData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ASSET_CREATE,
      resourceType: "asset",
      resourceId: asset.id,
      metadata: { name: asset.name },
    });

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Assets POST error:", err);
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

    const rateLimitResult = rateLimit(`assets:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    
    if (!body.id) {
      return NextResponse.json({ error: "Missing asset ID" }, { status: 400 });
    }

    const supabase = supabaseAdmin;

    const updateData = {
      name: body.name,
      category: body.category || null,
      acquisition_date: body.acquisition_date,
      acquisition_cost: body.acquisition_cost || 0,
      useful_life_months: body.useful_life_months || 60,
      salvage_value: body.salvage_value || 0,
      depreciation_method: body.depreciation_method || "straight_line",
      account_asset_id: body.account_asset_id || null,
      status: body.status || "active",
    };

    const { data: asset, error } = await supabase
      .from("assets")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ASSET_UPDATE,
      resourceType: "asset",
      resourceId: asset.id,
      metadata: { name: asset.name },
    });

    return NextResponse.json({ asset });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Assets PUT error:", err);
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

    const rateLimitResult = rateLimit(`assets:${orgId}`, 50, 60000);
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
      .from("assets")
      .delete()
      .eq("id", validation.data.id)
      .eq("org_id", orgId);

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.ASSET_DELETE,
      resourceType: "asset",
      resourceId: validation.data.id,
      metadata: {},
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Assets DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
