import AppLayout from "@/src/components/layout/AppLayout";

export default async function OrgLayout({ children, params }) {
  const { orgSlug } = await params;

  return (
    <AppLayout orgSlug={orgSlug}>
      {children}
    </AppLayout>
  );
}
