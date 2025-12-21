"use client";

import { useState, useCallback } from "react";

export function useBranches(orgSlug) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadBranches = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/branches", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar sucursales");
      setBranches(data.branches || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  const createBranch = useCallback(async (branchData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(branchData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear sucursal");
      await loadBranches();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug, loadBranches]);

  const updateBranch = useCallback(async (id, branchData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/branches", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id, ...branchData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar sucursal");
      await loadBranches();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug, loadBranches]);

  const deleteBranch = useCallback(async (id) => {
    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar sucursal");
      await loadBranches();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [orgSlug, loadBranches]);

  return {
    branches,
    loading,
    error,
    saving,
    loadBranches,
    createBranch,
    updateBranch,
    deleteBranch,
  };
}
