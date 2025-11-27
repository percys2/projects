import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  const supabase = await createServerSupabaseClient();
  const orgSlug = req.headers.get("x-org-slug");

  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", orgSlug)
    .single();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("org_id", org.id);

  return NextResponse.json(products);
}