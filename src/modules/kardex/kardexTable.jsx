"use client";

import React from "react";
import { formatCurrency } from "../POS/utils/formatCurrency";

// Timezone para Nicaragua
const TIMEZONE = "America/Managua";

// Formatear fecha en hora local de Nicaragua
const formatKardexDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("es-NI", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function KardexTable({
  data = [],
  page,
  setPage,
  limit,
  product,
  onPrint,
  onExportExcel,
}) {
  const totals = data.reduce(
    (acc, m) => {
      const rawQty = Number(m.qty || m.quantity || 0);
      const qty = isNaN(rawQty) ? 0 : rawQty;
      const cost = Number(m.cost_unit || m.cost || 0);
      const totalCost = Number(m.total_cost || m.total || Math.abs(qty) * cost);

      const type = (m.movement_type || "").toUpperCase();

      // Entradas: ENTRADA, ENTRY, SALE_CANCEL (restauración de inventario)
      const isEntrada =
        type === "ENTRADA" ||
        type === "ENTRY" ||
        type === "SALE_CANCEL" ||
        type === "PURCHASE" ||
        type === "ADJUSTMENT_IN";

      // Salidas: SALIDA, EXIT, SALE, VENTA
      const isSalida =
        type === "SALIDA" ||
        type === "EXIT" ||
        type === "SALE" ||
        type === "VENTA" ||
        type === "ADJUSTMENT_OUT";

      if (isEntrada) {
        acc.entradas += Math.abs(qty);
        acc.costoEntradas += Math.abs(totalCost);
      } else if (isSalida) {
        acc.salidas += Math.abs(qty);
        acc.costoSalidas += Math.abs(totalCost);
      }

      return acc;
    },
    { entradas: 0, salidas: 0, costoEntradas: 0, costoSalidas: 0 }
  );

  // Colores por tipo de movimiento (soporta mayúsculas y minúsculas)
  const getTypeColor = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "ENTRADA" || t === "ENTRY" || t === "SALE_CANCEL" || t === "PURCHASE") {
      return "text-green-600 font-semibold";
    }
    if (t === "SALIDA" || t === "EXIT" || t === "SALE" || t === "VENTA") {
      return "text-red-600 font-semibold";
    }
    if (t === "TRANSFERENCIA" || t === "TRANSFER") {
      return "text-blue-600 font-semibold";
    }
    if (t === "AJUSTE" || t === "ADJUSTMENT" || t === "ADJUSTMENT_IN" || t === "ADJUSTMENT_OUT") {
      return "text-gray-700 font-semibold";
    }
    return "text-slate-600";
  };

  // Traducir tipo de movimiento a español
  const translateMovementType = (type) => {
    const t = (type || "").toUpperCase();
    const translations = {
      "ENTRADA": "ENTRADA",
      "ENTRY": "ENTRADA",
      "SALIDA": "SALIDA",
      "EXIT": "SALIDA",
      "SALE": "VENTA",
      "VENTA": "VENTA",
      "SALE_CANCEL": "ANULACIÓN",
      "TRANSFER": "TRASLADO",
      "TRANSFERENCIA": "TRASLADO",
      "ADJUSTMENT": "AJUSTE",
      "AJUSTE": "AJUSTE",
      "ADJUSTMENT_IN": "AJUSTE +",
      "ADJUSTMENT_OUT": "AJUSTE -",
      "PURCHASE": "COMPRA",
    };
    return translations[t] || t;
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">
          Kardex — {product?.name || "Todos los productos"}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs hover:bg-slate-800"
          >
            Imprimir
          </button>

          <button
            onClick={onExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-green-700"
          >
            Excel
          </button>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-[11px] text-green-700 uppercase">Entradas</p>
          <p className="text-green-900 font-bold">{totals.entradas}</p>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[11px] text-red-700 uppercase">Salidas</p>
          <p className="text-red-900 font-bold">{totals.salidas}</p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[11px] text-blue-700 uppercase">Costo Entradas</p>
          <p className="text-blue-900 font-bold">
            {formatCurrency(totals.costoEntradas)}
          </p>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-[11px] text-gray-700 uppercase">Balance</p>
          <p className="text-gray-900 font-bold">
            {totals.entradas - totals.salidas}
          </p>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-auto border rounded-xl bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Movimiento</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-left">Cantidad</th>
              <th className="p-2 text-left">Costo</th>
              <th className="p-2 text-left">Total</th>
              <th className="p-2 text-left">Sucursal Origen</th>
              <th className="p-2 text-left">Sucursal Destino</th>
              <th className="p-2 text-left">Referencia</th>
              <th className="p-2 text-left">Usuario</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan="10" className="p-4 text-center text-slate-400">
                  No hay movimientos.
                </td>
              </tr>
            )}

            {data.map((m) => {
              const qty = Number(m.qty || m.quantity || 0);
              const cost = Number(m.cost_unit || m.cost || 0);
              const total = Number(m.total_cost || m.total || qty * cost);

              return (
                <tr key={m.id} className="border-b last:border-none">
                  <td className="p-2">
                    {formatKardexDateTime(m.created_at)}
                  </td>

                  <td className={`p-2 ${getTypeColor(m.movement_type)}`}>
                    {translateMovementType(m.movement_type)}
                  </td>

                  <td className="p-2">{m.product_name || "-"}</td>

                  <td className="p-2 font-semibold">{qty}</td>

                  <td className="p-2">{formatCurrency(cost)}</td>

                  <td className="p-2">{formatCurrency(total)}</td>

                  <td className="p-2">{m.from_branch_name || "-"}</td>

                  <td className="p-2">{m.to_branch_name || "-"}</td>

                  <td className="p-2 text-slate-500">{m.notes || "-"}</td>

                  <td className="p-2 text-slate-700">
                    {m.user_full_name || m.user_email || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className={`px-3 py-1 text-xs rounded-lg border ${
            page === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-slate-100"
          }`}
        >
          Anterior
        </button>

        <p className="text-xs text-slate-500">Página {page + 1}</p>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={data.length < limit}
          className={`px-3 py-1 text-xs rounded-lg border ${
            data.length < limit
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-slate-100"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}