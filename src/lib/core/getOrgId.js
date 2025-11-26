import { supabase } from "@/src/lib/api/supabaseClient";

export async function getOrgIdFromSlug(slug) {
  const { data, error } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data.id;
}
