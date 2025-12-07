"use client";

import { use } from "react";
import PosScreen from "@/src/modules/POS/PosScreen";

export default function PosPage({ params }) {
  const { orgSlug } = use(params);
  return <PosScreen orgSlug={orgSlug} />;
}
