import CrmScreen from "@/src/modules/crm/CrmScreen";

export default async function CrmPage({ params }) {
  const { orgSlug } = await params; // params ES PROMESA EN NEXT 16
  return <CrmScreen orgSlug={orgSlug} />;
}
