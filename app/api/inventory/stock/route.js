import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    const { data: stock, error } = await supabase
      .from("current_stock")
      .select("*")
      .eq("org_id", org.id)
      .order("name");   // ← CORREGIDO

    if (error) throw error;

    // get branches
    const { data: branches } = await supabase
      .from("branches")
      .select("*")
      .eq("org_id", org.id);

    return NextResponse.json({ stock, branches });

  } catch (err) {
    return NextResponse.json({ error: err.message });
  }
}
