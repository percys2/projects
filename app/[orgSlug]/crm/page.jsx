"use client";

import { use } from "react";
import CrmScreen from "@/src/modules/crm/CrmScreen";

export default function CrmPage({ params }) {
  const { orgSlug } = use(params);
  return <CrmScreen orgSlug={orgSlug} />;
}