"use client";

import { use } from "react";
import FinanceScreen from "@/src/modules/finance/FinanceScreen";

export default function FinancePage({ params }) {
  const { orgSlug } = use(params);

  return <FinanceScreen orgSlug={orgSlug} />;
}
