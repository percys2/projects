import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug)
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const { data, error } = await supabase
      .from("crm_opportunities")
      .select(`
        *,
        client:clients(id, first_name, last_name, phone),
        stage:crm_stages(id, name, code, color, probability, sort_order)
      `)
      .eq("org_id", org.id)
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
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug)
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const { data: defaultStage } = await supabase
      .from("crm_stages")
      .select("id")
      .eq("org_id", org.id)
      .eq("is_active", true)
      .order("sort_order")
      .limit(1)
      .single();

    if (!body.stage_id && !defaultStage) {
      return NextResponse.json({ error: "No hay etapas configuradas" }, { status: 400 });
    }

    const insertData = {
      org_id: org.id,
      title: body.title,
      client_id: body.client_id || null,
      amount: body.amount || 0,
      stage_id: body.stage_id || defaultStage?.id,
      status: body.status || "open",
      expected_close_date: body.expected_close_date || null,
      source: body.source || null,
      notes: body.notes || null,
    };

    const { data, error } = await supabase
      .from("crm_opportunities")
      .insert(insertData)
      .select(`*, client:clients(id, first_name, last_name, phone), stage:crm_stages(id, name, code, color, probability, sort_order)`)
      .single();

    if (error) throw error;
    return NextResponse.json({ opportunity: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug || !body.id)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

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
      .eq("org_id", org.id)
      .select(`*, client:clients(id, first_name, last_name, phone), stage:crm_stages(id, name, code, color, probability, sort_order)`)
      .single();

    if (error) throw error;
    return NextResponse.json({ opportunity: data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!orgSlug || !id)
      return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const { error } = await supabase
      .from("crm_opportunities")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}