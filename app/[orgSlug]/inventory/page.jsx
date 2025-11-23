"use client";

import InventoryScreen from "@/src/modules/inventory/inventoryScreen";

export default function InventoryPage({ params }) {
  return <InventoryScreen orgId={params.orgId} />;
}
