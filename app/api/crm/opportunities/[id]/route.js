import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function DELETE(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = await params;

    if (!orgSlug || !id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const { error } = await supabase
      .from("crm_opportunities")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("CRM opportunity DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = await params;

    if (!orgSlug || !id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations").select("id").eq("slug", orgSlug).single();
    if (orgError) throw orgError;

    const { data: opportunity, error } = await supabase
      .from("crm_opportunities")
      .select(`*, client:clients(id, name, phone), stage:crm_stages(id, name, code, color, probability)`)
      .eq("id", id)
      .eq("org_id", org.id)
      .single();

    if (error) throw error;

    return NextResponse.json({ opportunity });
  } catch (err) {
    console.error("CRM opportunity GET by ID error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}