import DashboardScreen from "@/src/modules/dashboard/DashboardScreen";
import { headers } from "next/headers";

export default function DashboardPage() {
  const orgId = headers().get("x-org-id");

  return <DashboardScreen orgId={orgId} />;
}
