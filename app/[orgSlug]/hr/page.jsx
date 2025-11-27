"use client";

import { use } from "react";
import HrScreen from "@/src/modules/hr/HrScreen";

export default function HrPage({ params }) {
  const { orgSlug } = use(params);
  return <HrScreen orgSlug={orgSlug} />;
}