"use client";

import { useState, useCallback } from "react";

/**
 * Hook for managing confirmation dialogs
 * 
 * Usage:
 * const { confirm, ConfirmDialog } = useConfirm();
 * 
 * const handleDelete = async () => {
 *   const confirmed = await confirm({
 *     title: "Eliminar venta",
 *     message: "¿Está seguro?",
 *     type: "danger"
 *   });
 *   if (confirmed) {
 *     // Delete logic
 *   }
 * };
 */
export function useConfirm() {
  const [dialogState, setDialogState] = useState({
    open: false,
    title: "",
    message: "",
    type: "warning",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    onConfirm: null,
    onCancel: null,
    loading: false,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setDialogState({
        open: true,
        title: options.title || "Confirmar acción",
        message: options.message || "",
        type: options.type || "warning",
        confirmText: options.confirmText || "Confirmar",
        cancelText: options.cancelText || "Cancelar",
        loading: false,
        onConfirm: async () => {
          setDialogState((prev) => ({ ...prev, loading: true }));
          try {
            if (options.onConfirm) {
              await options.onConfirm();
            }
            resolve(true);
            setDialogState((prev) => ({ ...prev, open: false, loading: false }));
          } catch (error) {
            setDialogState((prev) => ({ ...prev, loading: false }));
            resolve(false);
          }
        },
        onCancel: () => {
          resolve(false);
          setDialogState((prev) => ({ ...prev, open: false }));
        },
      });
    });
  }, []);

  const close = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  // Import ConfirmDialog dynamically to avoid circular dependencies
  let ConfirmDialogComponent = null;
  try {
    ConfirmDialogComponent = require("@/src/components/ui/ConfirmDialog").default;
  } catch (e) {
    console.warn("ConfirmDialog component not found");
  }

  return {
    confirm,
    close,
    ConfirmDialog: dialogState.open && ConfirmDialogComponent ? (
      <ConfirmDialogComponent
        open={dialogState.open}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        onConfirm={dialogState.onConfirm}
        onCancel={dialogState.onCancel}
        loading={dialogState.loading}
      />
    ) : null,
  };
}

