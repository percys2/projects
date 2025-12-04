import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const body = await req.json();
    const { orgSlug, name } = body;

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const { error } = await supabase
      .from("branches")
      .insert({
        org_id: org.id,
        name,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
