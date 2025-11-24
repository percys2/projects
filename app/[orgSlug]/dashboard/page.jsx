import DashboardScreen from "@/src/modules/dashboard/DashboardScreen";
import { headers } from "next/headers";

export default async function DashboardPage() {  // ← CHANGED: Added async
  const headersList = await headers();           // ← CHANGED: Added await
  const orgId = headersList.get("x-org-id");

  return <DashboardScreen orgId={orgId} />;
}
