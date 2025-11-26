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
  onEntry,
  onExit,
  onTransfer,
  orgId, // Necesario para el Kardex
}) {
  const safeProducts = Array.isArray(products) ? products : [];

  const getStock = (p) => p.stock ?? p.quantity ?? 0;
  const getUnitWeight = (p) =>
    p.unitWeight ?? p.unidad_medida ?? p.unit_medida ?? 0;

  // ----------------------------------------------------
  // ORDENAMIENTO
  // ----------------------------------------------------
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

  const toggleDirection = () => {
    setSortConfig((prev) => ({
      ...prev,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // ----------------------------------------------------
  // KPIs fallback
  // ----------------------------------------------------
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

  return (
    <div className="space-y-3">

      {/* ============================================================
          KPI CARDS
      ============================================================ */}
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

      {/* ============================================================
          TABLA
      ============================================================ */}
      <div className="w-full overflow-auto max-h-[520px]">
        <table className="min-w-full text-[12px]">
          <thead>
            <tr className="bg-slate-50 border-b text-[11px] uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">PRODUCTO</th>
              <th className="px-2 py-2">CÓDIGO</th>
              <th className="px-2 py-2">CATEGORÍA</th>
              <th className="px-2 py-2">BODEGA</th>
              <th className="px-2 py-2 text-right">CANTIDAD</th>
              <th className="px-2 py-2 text-right">PESO</th>
              <th className="px-2 py-2 text-right">COSTO</th>
              <th className="px-2 py-2 text-right">COSTO TOTAL</th>
              <th className="px-2 py-2 text-right">PRECIO</th>
              <th className="px-2 py-2 text-right">PRECIO X LB</th>
              <th className="px-2 py-2 text-right">DÍAS PARA VENCER</th>
              <th className="px-2 py-2">VENCE</th>
              <th className="px-2 py-2 text-right">ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-3 py-4 text-center text-slate-400">
                  No hay productos
                </td>
              </tr>
            ) : (
              sortedProducts.map((p) => {
                const stock = getStock(p);
                const weight = getUnitWeight(p);
                const costTotal = stock * (p.cost ?? 0);
                const pricePerLb = p.price && weight ? p.price / weight : null;
                const daysToExpire = computeDaysToExpire(p.expiresAt);

                return (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-slate-50 transition"
                  >
                    <td className="px-2 py-1.5">{p.name}</td>
                    <td className="px-2 py-1.5">{p.sku ?? p.id}</td>
                    <td className="px-2 py-1.5">{p.category}</td>
                    <td className="px-2 py-1.5">{p.branch}</td>

                    <td className="px-2 py-1.5 text-right">{stock}</td>
                    <td className="px-2 py-1.5 text-right">{weight}</td>

                    <td className="px-2 py-1.5 text-right">
                      C$ {p.cost?.toLocaleString("es-NI")}
                    </td>

                    <td className="px-2 py-1.5 text-right">
                      C$ {costTotal.toLocaleString("es-NI")}
                    </td>

                    <td className="px-2 py-1.5 text-right">
                      C$ {p.price?.toLocaleString("es-NI")}
                    </td>

                    <td className="px-2 py-1.5 text-right">
                      {pricePerLb ? `C$ ${pricePerLb.toFixed(2)}` : "-"}
                    </td>

                    <td className="px-2 py-1.5 text-right">
                      {daysToExpire ?? "—"}
                    </td>

                    <td className="px-2 py-1.5">{p.expiresAt}</td>

                    <td className="px-2 py-1.5 text-right">
                      <div className="flex justify-end gap-1">

                        {/* KARDEX */}
                        <a
                          href={`/app/${orgId}/inventory/${p.productId}/kardex`}
                          className="px-2 py-1 text-[11px] bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          Kardex
                        </a>

                        {/* Entrada */}
                        <button
                          onClick={() => onEntry && onEntry(p)}
                          className="px-2 py-1 text-[11px] bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Entrada
                        </button>

                        {/* Salida */}
                        <button
                          onClick={() => onExit && onExit(p)}
                          className="px-2 py-1 text-[11px] bg-orange-600 text-white rounded hover:bg-orange-700"
                        >
                          Salida
                        </button>

                        {/* Traslado */}
                        <button
                          onClick={() => onTransfer && onTransfer(p)}
                          className="px-2 py-1 text-[11px] bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Traslado
                        </button>

                        {/* Editar */}
                        <button
                          onClick={() => onEdit && onEdit(p)}
                          className="px-2 py-1 text-[11px] bg-slate-800 text-white rounded hover:bg-slate-700"
                        >
                          Editar
                        </button>

                        {/* Eliminar */}
                        <button
                          onClick={() => onDelete && onDelete(p.id)}
                          className="px-2 py-1 text-[11px] bg-red-500 text-white rounded hover:bg-red-600"
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
