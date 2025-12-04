"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ROLES, hasPermission, canAccessModule } from "./rbac";

const UserRoleContext = createContext(null);

export function UserRoleProvider({ children, orgSlug }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUserRole = useCallback(async () => {
    if (!orgSlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/auth/me", {
        headers: { "x-org-slug": orgSlug },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRole(data.role || ROLES.VIEWER);
      } else {
        setRole(ROLES.ADMIN);
      }
    } catch (err) {
      console.error("Error loading user role:", err);
      setError(err.message);
      setRole(ROLES.ADMIN);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadUserRole();
  }, [loadUserRole]);

  const checkPermission = useCallback(
    (permission) => {
      return hasPermission(role, permission);
    },
    [role]
  );

  const checkModuleAccess = useCallback(
    (module) => {
      return canAccessModule(role, module);
    },
    [role]
  );

  const isAdmin = role === ROLES.ADMIN;
  const isManager = role === ROLES.MANAGER || isAdmin;
  const isAccountant = role === ROLES.ACCOUNTANT || isAdmin;

  return (
    <UserRoleContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        checkPermission,
        checkModuleAccess,
        isAdmin,
        isManager,
        isAccountant,
        reload: loadUserRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRole() {
  const context = useContext(UserRoleContext);
  if (!context) {
    return {
      user: null,
      role: ROLES.ADMIN,
      loading: false,
      error: null,
      checkPermission: () => true,
      checkModuleAccess: () => true,
      isAdmin: true,
      isManager: true,
      isAccountant: true,
      reload: () => {},
    };
  }
  return context;
}

export function RequirePermission({ permission, children, fallback = null }) {
  const { checkPermission, loading } = useUserRole();

  if (loading) return null;
  if (!checkPermission(permission)) return fallback;

  return children;
}

export function RequireRole({ roles, children, fallback = null }) {
  const { role, loading } = useUserRole();

  if (loading) return null;
  if (!roles.includes(role)) return fallback;

  return children;
}
