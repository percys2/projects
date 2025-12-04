"use client";

import { useParams } from "next/navigation";
import DashboardScreen from "@/src/modules/dashboard/DashboardScreen";

export default function DashboardPage() {
  const params = useParams();
  const orgSlug = params.orgSlug;

  return <DashboardScreen orgSlug={orgSlug} />;
}
