"use client";

import FinanceScreen from "@/src/modules/finance/FinanceScreen";

export default function FinancePage({ params }) {
  return <FinanceScreen orgSlug={params.orgSlug} />;
}
