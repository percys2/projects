import DashboardScreen from "@/src/modules/dashboard/DashboardScreen";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const headersList = await headers();
  const orgId = headersList.get("x-org-id");

  return <DashboardScreen orgId={orgId} />;
}
