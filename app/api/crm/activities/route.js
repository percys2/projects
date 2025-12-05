import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get("opportunity_id");
    const clientId = searchParams.get("client_id");

    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    let query = supabase
      .from("crm_activities")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    if (opportunityId) query = query.eq("opportunity_id", opportunityId);
    if (clientId) query = query.eq("client_id", clientId);

    const { data: activities, error } = await query;
    if (error) throw error;

    return NextResponse.json({ activities: activities || [] });
  } catch (err) {
    console.error("CRM activities GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const activityData = {
      org_id: org.id,
      client_id: body.client_id || null,
      opportunity_id: body.opportunity_id || null,
      type: body.type,
      subject: body.subject,
      description: body.description || null,
      due_date: body.due_date || null,
      completed_at: body.completed_at || null,
      outcome: body.outcome || null,
      next_step: body.next_step || null,
    };

    const { data: activity, error } = await supabase
      .from("crm_activities")
      .insert(activityData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ activity });
  } catch (err) {
    console.error("CRM activities POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
