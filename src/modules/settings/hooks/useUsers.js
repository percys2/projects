"use client";

import { useState, useCallback } from "react";

export function useUsers(orgSlug) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    if (!orgSlug) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/users", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar usuarios");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  const createUser = useCallback(async (userData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear usuario");
      await loadUsers();
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug, loadUsers]);

  const updateUser = useCallback(async (id, userData) => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id, ...userData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");
      await loadUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  }, [orgSlug, loadUsers]);

  const deleteUser = useCallback(async (id) => {
    try {
      const res = await fetch("/api/settings/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");
      await loadUsers();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [orgSlug, loadUsers]);

  return {
    users,
    loading,
    error,
    saving,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
  };
}