import AppLayout from "@/src/components/layout/AppLayout";

export default function OrgLayout({ children, params }) {
  const orgSlug = params.orgSlug;

  return (
    <AppLayout orgSlug={orgSlug}>
      {children}
    </AppLayout>
  );
}
