"use client";

import { useState, useCallback } from "react";

export function useOrganization(orgSlug) {
  const [organization, setOrganization] = useState({
    name: "",
    email: "",
    phone: "",
    currency: "NIO",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadOrganization = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const res = await fetch("/api/settings/organization", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (res.ok && data.organization) {
        setOrganization({
          name: data.organization.name || "",
          email: data.organization.email || "",
          phone: data.organization.phone || "",
          currency: data.organization.currency || "NIO",
        });
      }
    } catch (err) {
      console.error("Error loading organization:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  const saveOrganization = useCallback(async (orgData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(orgData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setOrganization(orgData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug]);

  return {
    organization,
    setOrganization,
    loading,
    saving,
    loadOrganization,
    saveOrganization,
  };
}