import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const { data: opportunities, error } = await supabase
      .from("crm_opportunities")
      .select(`*, client:clients(id, name, phone), stage:crm_stages(id, name, code, color, probability, sort_order)`)
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedOpportunities = (opportunities || []).map((opp) => ({
      ...opp,
      client_id: opp.client?.id,
      client_name: opp.client?.name,
      client_phone: opp.client?.phone,
      stage_id: opp.stage?.id || opp.stage_id,
      stage_name: opp.stage?.name,
      stage_color: opp.stage?.color,
      stage_probability: opp.stage?.probability,
    }));

    return NextResponse.json({ opportunities: formattedOpportunities });
  } catch (err) {
    console.error("CRM opportunities GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const opportunityData = {
      org_id: org.id,
      name: body.name,
      client_id: body.client_id || null,
      amount: body.amount || 0,
      stage_id: body.stage_id,
      status: body.status || "open",
      expected_close_date: body.expected_close_date || null,
      source: body.source || null,
      notes: body.notes || null,
    };

    const { data: opportunity, error } = await supabase
      .from("crm_opportunities")
      .insert(opportunityData)
      .select(`*, client:clients(id, name, phone), stage:crm_stages(id, name, code, color, probability)`)
      .single();

    if (error) throw error;

    const formattedOpportunity = {
      ...opportunity,
      client_id: opportunity.client?.id,
      client_name: opportunity.client?.name,
      client_phone: opportunity.client?.phone,
      stage_id: opportunity.stage?.id || opportunity.stage_id,
      stage_name: opportunity.stage?.name,
      stage_color: opportunity.stage?.color,
    };

    return NextResponse.json({ opportunity: formattedOpportunity });
  } catch (err) {
    console.error("CRM opportunities POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.client_id !== undefined) updateData.client_id = body.client_id;
    if (body.amount !== undefined) updateData.amount = body.amount;
    if (body.stage_id !== undefined) updateData.stage_id = body.stage_id;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.expected_close_date !== undefined) updateData.expected_close_date = body.expected_close_date;
    if (body.source !== undefined) updateData.source = body.source;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.lost_reason !== undefined) updateData.lost_reason = body.lost_reason;
    updateData.updated_at = new Date().toISOString();

    const { data: opportunity, error } = await supabase
      .from("crm_opportunities")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select(`*, client:clients(id, name, phone), stage:crm_stages(id, name, code, color, probability)`)
      .single();

    if (error) throw error;

    const formattedOpportunity = {
      ...opportunity,
      client_id: opportunity.client?.id,
      client_name: opportunity.client?.name,
      client_phone: opportunity.client?.phone,
      stage_id: opportunity.stage?.id || opportunity.stage_id,
      stage_name: opportunity.stage?.name,
      stage_color: opportunity.stage?.color,
    };

    return NextResponse.json({ opportunity: formattedOpportunity });
  } catch (err) {
    console.error("CRM opportunities PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}