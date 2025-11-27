"use client";

import { use } from "react";
import DashboardScreen from "@/src/modules/dashboard/DashboardScreen";

export default function DashboardPage({ params }) {
  const { orgSlug } = use(params);
  return <DashboardScreen orgSlug={orgSlug} />;
}