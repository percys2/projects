"use client";

import OdontologyScreen from "@/src/modules/odontology/OdontologyScreen";

export default function OdontologyPage({ params }) {
  const { orgSlug } = params;
  return <OdontologyScreen orgSlug={orgSlug} />;
}

