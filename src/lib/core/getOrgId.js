import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function getOrgIdFromSlug(slug) {
  const { data, error } = await supabaseAdmin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data.id;
}