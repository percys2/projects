"use client";

import { use } from "react";
import SalesScreen from "@/src/modules/sales/SalesScreen";

export default function SalesPage({ params }) {
  const { orgSlug } = use(params);
  return <SalesScreen orgSlug={orgSlug} />;
}