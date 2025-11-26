import { createClient } from "@/src/lib/supabase/server-client";
import KardexScreen from "@/src/modules/Kardex/kardexScreen";
import { redirect } from "next/navigation";

export default async function KardexPage({ params }) {
  const supabase = createClient();
  const { orgSlug } = params;

  // User session
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  // Organization
  const { data: org } = await supabase
    .from("organizations")
    .select("id, name")
    .eq("slug", orgSlug)
    .single();

  if (!org) redirect("/login");

  const orgId = org.id;

  const { data: products } = await supabase
    .from("products")
    .select("id, name, category")
    .eq("org_id", orgId);

  const { data: branches } = await supabase
    .from("branches")
    .select("id, name")
    .eq("org_id", orgId);

  return (
    <div className="p-4">
      <KardexScreen
        orgId={orgId}
        products={products ?? []}
        branches={branches ?? []}
      />
    </div>
  );
}
