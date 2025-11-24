"use client";

import SalesScreen from "@/src/modules/sales/SalesScreen";

export default function SalesPage({ params }) {
  return <SalesScreen orgSlug={params.orgSlug} />;
}
