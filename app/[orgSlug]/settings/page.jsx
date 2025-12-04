"use client";

import { use } from "react";
import SettingsScreen from "@/src/modules/settings/SettingsScreen";

export default function SettingsPage({ params }) {
  const { orgSlug } = use(params);
  return <SettingsScreen orgSlug={orgSlug} />;
}
