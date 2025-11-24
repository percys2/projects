"use client";

import HrScreen from "@/src/modules/hr/HrScreen";

export default function HrPage({ params }) {
  return <HrScreen orgSlug={params.orgSlug} />;
}
