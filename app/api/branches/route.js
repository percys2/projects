import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ branches: branches || [] });
  } catch (err) {
    console.error("Branches GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}