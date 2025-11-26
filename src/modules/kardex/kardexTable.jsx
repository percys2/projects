"use client";

import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "../POS/utils/formatCurrency";

export default function KardexTable({
  data = [],
  page,
  setPage,
  limit,
  product,
  branch,
  onPrint,
  onExportExcel,
}) {
  // -----------------------------
  // TOTALES
  // -----------------------------
  const totals = data.reduce(
    (acc, m) => {
      const qty = Number(m.qty);
      const totalCost = Number(m.total_cost);

      if (m.movement_type === "entrada") {
        acc.entradas += qty;
        acc.costoEntradas += totalCost;
      }
      if (m.movement_type === "salida") {
        acc.salidas += qty;
        acc.costoSalidas += totalCost;
      }

      return acc;
    },
    {
      entradas: 0,
      salidas: 0,
      costoEntradas: 0,
      costoSalidas: 0,
    }
  );

  const typeColors = {
    entrada: "text-green-600 font-semibold",
    salida: "text-red-600 font-semibold",
    transferencia: "text-blue-600 font-semibold",
    venta: "text-orange-600 font-semibold",
    ajuste: "text-gray-700 font-semibold",
  };

  return (
    <div className="space-y-4">

      {/* ---------------------------- */}
      {/* ENCABEZADO + BOTONES */}
      {/* ---------------------------- */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">
          Kardex — {product?.name || "Todos los productos"}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs hover:bg-slate-800"
          >
            🖨 Imprimir
          </button>

          <button
            onClick={onExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-green-700"
          >
            📊 Excel
          </button>
        </div>
      </div>

      {/* ---------------------------- */}
      {/* TOTALES */}
      {/* ---------------------------- */}
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

      {/* ---------------------------- */}
      {/* TABLA */}
      {/* ---------------------------- */}
      <div className="overflow-auto border rounded-xl bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Movimiento</th>
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
                <td colSpan="9" className="p-4 text-center text-slate-400">
                  No hay movimientos.
                </td>
              </tr>
            )}

            {data.map((m) => (
              <tr key={m.id} className="border-b last:border-none">
                <td className="p-2">
                  {format(new Date(m.created_at), "dd/MM/yyyy HH:mm", {
                    locale: es,
                  })}
                </td>

                <td className={`p-2 ${typeColors[m.movement_type]}`}>
                  {m.movement_type.toUpperCase()}
                </td>

                <td className="p-2 font-semibold">{m.qty}</td>
                <td className="p-2">{formatCurrency(m.cost_unit)}</td>
                <td className="p-2">{formatCurrency(m.total_cost)}</td>

                <td className="p-2">{m.from_branch || "-"}</td>
                <td className="p-2">{m.to_branch || "-"}</td>
                <td className="p-2 text-slate-500">{m.reference || "-"}</td>

                <td className="p-2 text-slate-700">
                  {m.user?.full_name || m.user?.email || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------------------- */}
      {/* PAGINACIÓN */}
      {/* ---------------------------- */}
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
          ⬅ Anterior
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
          Siguiente ➡
        </button>
      </div>
    </div>
  );
}
