"use client";

import { useState, useCallback } from "react";

export function usePreferences(orgSlug) {
  const [preferences, setPreferences] = useState({
    timezone: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (res.ok && data.preferences) {
        setPreferences({
          timezone: data.preferences.timezone || "",
        });
      }
    } catch (err) {
      console.error("Error loading preferences:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  const savePreferences = useCallback(async (prefsData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(prefsData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setPreferences(prefsData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug]);

  return {
    preferences,
    setPreferences,
    loading,
    saving,
    loadPreferences,
    savePreferences,
  };
}