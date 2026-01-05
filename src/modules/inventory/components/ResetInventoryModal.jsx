"use client";

import React, { useState, useEffect } from "react";

export default function ResetInventoryModal({
  isOpen,
  onClose,
  orgSlug,
  onSuccess,
}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [branchToReset, setBranchToReset] = useState("");
  const [stockBranches, setStockBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchError, setBranchError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setConfirmed(false);
      setResult(null);
      setBranchToReset("");
      loadBranchesFromStock();
    }
  }, [isOpen]);

  const loadBranchesFromStock = async () => {
    setLoadingBranches(true);
    setBranchError(null);
    try {
      const res = await fetch("/api/inventory/branches-with-stock", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      
      if (data.error) {
        setBranchError(data.error);
        console.error("Error from API:", data.error, data.debug);
      }
      
      if (data.branches && data.branches.length > 0) {
        setStockBranches(data.branches);
        if (data.branches.length === 1) {
          setBranchToReset(data.branches[0].id);
        }
      } else {
        setStockBranches([]);
        if (data.debug) {
          console.log("Debug info:", data.debug);
          setBranchError(`Debug: ${JSON.stringify(data.debug)}`);
        }
      }
    } catch (err) {
      console.error("Error loading branches:", err);
      setBranchError(err.message);
    } finally {
      setLoadingBranches(false);
    }
  };

  const branchName = stockBranches.find((b) => b.id === branchToReset)?.name || "Sin seleccionar";

  const handleReset = async () => {
    if (!branchToReset) {
      alert("Debe seleccionar una sucursal antes de resetear el inventario");
      return;
    }

    const confirmacion = window.confirm(
      `ATENCION: Esta a punto de BORRAR TODO el inventario de la sucursal "${branchName}".\n\nEsta accion NO se puede deshacer.\n\n¿Esta completamente seguro de continuar?`
    );

    if (!confirmacion) return;

    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch("/api/inventory/reset-stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ branchId: branchToReset }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || "Error al resetear inventario" });
      } else {
        setResult({
          success: true,
          message: data.message,
          processed: data.processed,
          failed: data.failed,
        });

        if (data.processed > 0) {
          setTimeout(() => {
            onSuccess?.();
            handleClose();
          }, 2000);
        }
      }
    } catch (err) {
      setResult({ success: false, message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    setConfirmed(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
        <div className="p-4 border-b bg-red-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-bold text-red-800">Resetear Inventario a 0</h2>
                <p className="text-xs text-red-600">Esta accion no se puede deshacer</p>
              </div>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Seleccione la sucursal a resetear:
            </label>
            {loadingBranches ? (
              <div className="text-center py-2 text-slate-500">Cargando sucursales...</div>
            ) : branchError ? (
              <div className="text-left py-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg overflow-auto max-h-40">
                <p className="font-bold mb-1">Error/Debug:</p>
                <p className="break-all">{branchError}</p>
              </div>
            ) : stockBranches.length === 0 ? (
              <div className="text-center py-2 text-amber-600">No hay sucursales con stock para resetear</div>
            ) : (
              <select
                value={branchToReset}
                onChange={(e) => {
                  setBranchToReset(e.target.value);
                  setConfirmed(false);
                  setResult(null);
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="">-- Seleccione una sucursal --</option>
                {stockBranches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.productCount} productos)
                  </option>
                ))}
              </select>
            )}
          </div>

          {branchToReset && (
            <>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-slate-600">Sucursal seleccionada:</p>
                <p className="text-lg font-bold text-slate-800">{branchName}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-amber-800">
                  <strong>Advertencia:</strong> Esta accion pondra en 0 el stock de TODOS los productos en la sucursal seleccionada.
                </p>
              </div>

              {!confirmed && !result && (
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="confirm-reset"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="w-4 h-4 text-red-600 rounded"
                  />
                  <label htmlFor="confirm-reset" className="text-sm text-slate-700">
                    Entiendo que esta accion no se puede deshacer
                  </label>
                </div>
              )}

              {result && (
                <div className={`p-4 rounded-lg mb-4 ${result.success ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <p className={`text-sm font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                    {result.message}
                  </p>
                  {result.success && result.processed > 0 && (
                    <p className="text-xs text-green-600 mt-1">{result.processed} producto(s) reseteado(s)</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="flex gap-3">
            <button onClick={handleClose} className="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium">
              Cancelar
            </button>
            {branchToReset && !result?.success && (
              <button
                onClick={handleReset}
                disabled={!confirmed || submitting}
                className={`flex-1 px-4 py-3 rounded-lg font-medium ${
                  confirmed && !submitting ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {submitting ? "Procesando..." : "Resetear a 0"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
