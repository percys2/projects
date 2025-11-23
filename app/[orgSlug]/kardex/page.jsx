"use client";

import KardexScreen from "@/src/modules/kardex/kardexScreen";

export default function Page({ params }) {
  const { orgId, productId } = params;
  return <KardexScreen orgId={orgId} productId={productId} />;
}