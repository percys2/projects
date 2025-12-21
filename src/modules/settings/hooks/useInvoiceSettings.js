"use client";

import { useState, useCallback } from "react";

export function useInvoiceSettings(orgSlug) {
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "FAC",
    next_number: 1,
    tax_rate: 15,
    tax_name: "IVA",
    show_tax: true,
    footer_text: "",
    terms: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadInvoiceSettings = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const res = await fetch("/api/settings/invoices", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (res.ok && data.settings) {
        setInvoiceSettings({
          prefix: data.settings.prefix || "FAC",
          next_number: data.settings.next_number || 1,
          tax_rate: data.settings.tax_rate || 15,
          tax_name: data.settings.tax_name || "IVA",
          show_tax: data.settings.show_tax !== false,
          footer_text: data.settings.footer_text || "",
          terms: data.settings.terms || "",
        });
      }
    } catch (err) {
      console.error("Error loading invoice settings:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  const saveInvoiceSettings = useCallback(async (settings) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setInvoiceSettings(settings);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug]);

  return {
    invoiceSettings,
    setInvoiceSettings,
    loading,
    saving,
    loadInvoiceSettings,
    saveInvoiceSettings,
  };
}