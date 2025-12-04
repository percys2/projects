"use client";

import KardexScreen from "@/src/modules/kardex/kardexScreen";
import { useParams } from "next/navigation";

export default function Page() {
  const params = useParams();
  return <KardexScreen orgSlug={params.orgSlug} />;
}

