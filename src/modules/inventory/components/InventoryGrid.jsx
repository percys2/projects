"use client";

import React, { useMemo, useState } from "react";

function computeDaysToExpire(expiresAt) {
  if (!expiresAt) return null;
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const exp = new Date(expiresAt + "T00:00:00");
  return Math.ceil((exp - base) / (1000 * 60 * 60 * 24));
}

export default function InventoryGrid({
  products,
  stats,
  onEdit,
  onDelete,
  onToggleActive,
  onEntry,
  onExit,
  onTransfer,
  onKardex,
  orgSlug,
}) {
  const safeProducts = Array.isArray(products) ? products : [];
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);

  const getStock = (p) => p.stock ?? p.quantity ?? 0;
  const getUnitWeight = (p) =>
    p.unitWeight ?? p.unidad_medida ?? p.unit_medida ?? 0;

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const getSortValue = (p, key) => {
    switch (key) {
      case "costTotal":
        return getStock(p) * (p.cost ?? 0);
      case "pricePerLb": {
        const w = getUnitWeight(p);
        return p.price && w ? p.price / w : null;
      }
      case "daysToExpire":
        return computeDaysToExpire(p.expiresAt);
      default:
        return p[key];
    }
  };

  const sortedProducts = useMemo(() => {
    const arr = [...safeProducts];
    if (!sortConfig.key) return arr;

    return arr.sort((a, b) => {
      const va = getSortValue(a, sortConfig.key);
      const vb = getSortValue(b, sortConfig.key);

      if (va == null) return 1;
      if (vb == null) return -1;

      if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
      if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;

      return 0;
    });
  }, [safeProducts, sortConfig]);

  const {
    totalProducts = safeProducts.length,
    totalUnits = safeProducts.reduce((sum, p) => sum + getStock(p), 0),
    inventoryValue = safeProducts.reduce(
      (sum, p) => sum + getStock(p) * (p.cost ?? 0),
      0
    ),
    potentialRevenue = safeProducts.reduce(
      (sum, p) => sum + getStock(p) * (p.price ?? 0),
      0
    ),
  } = stats || {};

  const handleDeleteClick = (product) => setDeleteConfirm(product);

  const confirmDelete = async () => {
    if (deleteConfirm && onDelete) {
      const result = await onDelete(deleteConfirm.id);
      if (result && result.hasHistory) {
        setDeactivateConfirm({
          ...deleteConfirm,
          productId: result.productId
        });
      }
      setDeleteConfirm(null);
    }
  };

  const confirmDeactivate = async () => {
    if (deactivateConfirm && onToggleActive) {
      const result = await onToggleActive(deactivateConfirm.productId, false);
      if (!result?.success) {
        alert(result?.error || "Error al desactivar el producto. Verifique que la columna 'active' existe en la tabla products.");
        return;
      }
      setDeactivateConfirm(null);
    }
  };

  return (
    <div className="space-y-3">

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">
              Confirmar eliminación
            </h3>

            <p className="text-slate-600 my-4">
              ¿Eliminar <strong>{deleteConfirm.name}</strong>? Esta acción es permanente.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE CONFIRM MODAL */}
      {deactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">
              Producto con historial
            </h3>

            <p className="text-slate-600 my-4">
              <strong>{deactivateConfirm.name}</strong> tiene movimientos históricos y no puede eliminarse.
              ¿Desea desactivarlo en su lugar? El producto no aparecerá en las listas pero su historial se conservará.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeactivateConfirm(null)}
                className="px-4 py-2 bg-slate-200 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivate}
                className="px-4 py-2 bg-amber-600 text-white rounded"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Productos</p>
          <p className="text-lg font-semibold">{totalProducts}</p>
        </div>

        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Unidades</p>
          <p className="text-lg font-semibold">
            {totalUnits.toLocaleString("es-NI")}
          </p>
        </div>

        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Valor inventario</p>
          <p className="text-lg font-semibold text-emerald-700">
            C$ {inventoryValue.toLocaleString("es-NI")}
          </p>
        </div>

        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Potencial de venta</p>
          <p className="text-lg font-semibold text-indigo-700">
            C$ {potentialRevenue.toLocaleString("es-NI")}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="w-full overflow-auto max-h-[520px]">
        <table className="min-w-full text-[12px]">
          <thead>
            <tr className="bg-slate-50 border-b text-[11px] uppercase text-slate-500">
              <th className="px-2 py-2">Producto</th>
              <th className="px-2 py-2">Código</th>
              <th className="px-2 py-2">Categoría</th>
              <th className="px-2 py-2">Bodega</th>
              <th className="px-2 py-2 text-right">Cantidad</th>
              <th className="px-2 py-2 text-right">Peso</th>
              <th className="px-2 py-2 text-right">Costo</th>
              <th className="px-2 py-2 text-right">Costo total</th>
              <th className="px-2 py-2 text-right">Precio</th>
              <th className="px-2 py-2 text-right">Precio x lb</th>
              <th className="px-2 py-2 text-right">Días p/ vencer</th>
              <th className="px-2 py-2">Vence</th>
              <th className="px-2 py-2 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No hay productos
                </td>
              </tr>
            ) : (
              sortedProducts.map((p) => {
                const stock = getStock(p);
                const weight = getUnitWeight(p);
                const pricePerLb =
                  p.price && weight ? p.price / weight : null;

                const costTotal = stock * (p.cost ?? 0);

                return (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="px-2 py-1.5">{p.name}</td>
                    <td className="px-2 py-1.5">{p.sku ?? p.id}</td>
                    <td className="px-2 py-1.5">{p.category}</td>
                    <td className="px-2 py-1.5">{p.branch ?? p.branch_name}</td>
                    <td className="px-2 py-1.5 text-right">{stock}</td>
                    <td className="px-2 py-1.5 text-right">{weight}</td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      C${(p.cost ?? 0).toLocaleString("es-NI")}
                    </td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      C${costTotal.toLocaleString("es-NI")}
                    </td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      C${(p.price ?? 0).toLocaleString("es-NI")}
                    </td>
                    <td className="px-2 py-1.5 text-right whitespace-nowrap">
                      {pricePerLb ? `C$${pricePerLb.toFixed(2)}` : "-"}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      {computeDaysToExpire(p.expiresAt) ?? "—"}
                    </td>
                    <td className="px-2 py-1.5">{p.expiresAt}</td>

                    {/* ACTIONS */}
                    <td className="px-2 py-1.5 text-right">
                      <div className="flex justify-end gap-1 flex-wrap">

                        {/* HISTORIAL / KARDEX */}
                        <button
                          onClick={() => {
                            onKardex(p);
                          }}
                          className="px-2 py-1 text-[11px] bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Historial
                        </button>

                        <button
                          onClick={() => onEntry && onEntry(p)}
                          className="px-2 py-1 text-[11px] bg-emerald-600 text-white rounded"
                        >
                          Entrada
                        </button>

                        <button
                          onClick={() => onExit && onExit(p)}
                          className="px-2 py-1 text-[11px] bg-orange-600 text-white rounded"
                        >
                          Salida
                        </button>

                        <button
                          onClick={() => onTransfer && onTransfer(p)}
                          className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded"
                        >
                          Traslado
                        </button>

                        <button
                          onClick={() => onEdit && onEdit(p)}
                          className="px-2 py-1 text-[11px] bg-slate-800 text-white rounded"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => setDeleteConfirm(p)}
                          className="px-2 py-1 text-[11px] bg-red-600 text-white rounded"
                        >
                          Eliminar
                        </button>

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}