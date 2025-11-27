"use client";

import { use } from "react";
import InventoryScreen from "@/src/modules/inventory/inventoryScreen";

export default function InventoryPage({ params }) {
  const { orgSlug } = use(params);
  return <InventoryScreen orgSlug={orgSlug} />;
}