"use client";

import React from "react";

export default function SalesFilters({ filters, branches, onFilterChange, onClearFilters }) {
  return (
    <div className="bg-white rounded-xl border p-3 sm:p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div>
          <label className="text-xs font-medium text-slate-600">Buscar</label>
          <input type="text" value={filters.search} onChange={(e) => onFilterChange("search", e.target.value)} placeholder="Cliente, factura, ID..." className="w-full p-2 text-sm border rounded-lg min-h-[44px]" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Fecha inicio</label>
          <input type="date" value={filters.dateStart} onChange={(e) => onFilterChange("dateStart", e.target.value)} className="w-full p-2 text-sm border rounded-lg min-h-[44px]" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Fecha fin</label>
          <input type="date" value={filters.dateEnd} onChange={(e) => onFilterChange("dateEnd", e.target.value)} className="w-full p-2 text-sm border rounded-lg min-h-[44px]" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600">Sucursal</label>
          <select value={filters.selectedBranch} onChange={(e) => onFilterChange("selectedBranch", e.target.value)} className="w-full p-2 text-sm border rounded-lg min-h-[44px] bg-white">
            <option value="">Todas las sucursales</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button onClick={onClearFilters} className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]">Limpiar filtros</button>
        </div>
      </div>
    </div>
  );
}