"use client";

import React from "react";

export default function KardexFilters({ filters, setFilters, branches }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">

        {/* Fecha desde */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Fecha desde
          </label>
          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
            className="w-full border rounded-lg px-2 py-1 text-xs"
          />
        </div>

        {/* Fecha hasta */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Fecha hasta
          </label>
          <input
            type="date"
            value={filters.toDate}
            onChange={(e) =>
              setFilters({ ...filters, toDate: e.target.value })
            }
            className="w-full border rounded-lg px-2 py-1 text-xs"
          />
        </div>

        {/* Tipo de movimiento */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Tipo
          </label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="w-full border rounded-lg px-2 py-1 text-xs"
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="salida">Salida</option>
            <option value="transferencia">Transferencia</option>
          </select>
        </div>

        {/* Sucursal */}
        <div>
          <label className="block text-[10px] font-semibold text-slate-600 mb-1">
            Sucursal
          </label>
          <select
            value={filters.branch}
            onChange={(e) =>
              setFilters({ ...filters, branch: e.target.value })
            }
            className="w-full border rounded-lg px-2 py-1 text-xs"
          >
            <option value="">Todas</option>
            {branches?.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          onClick={filters.apply}
          className="px-4 py-2 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-700"
        >
          Aplicar filtros
        </button>

        <button
          onClick={filters.clear}
          className="px-4 py-2 text-xs bg-red-200 text-red-700 rounded-lg hover:bg-red-300"
        >
          Limpiar
        </button>
      </div>
    </div>
  );
}
