"use client";

import SettingsScreen from "@/src/modules/settings/SettingsScreen";

export default function SettingsPage({ params }) {
  return <SettingsScreen orgSlug={params.orgSlug} />;
}
