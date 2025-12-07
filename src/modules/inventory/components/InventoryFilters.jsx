"use client";

import React from "react";
import { Search } from "lucide-react";

export default function InventoryFilters({
  search,
  setSearch,
  category,
  setCategory,
  branch,
  setBranch,
  lowStockOnly,
  setLowStockOnly,
  categories = [],
  branches = [],
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 sm:gap-4 mb-4 sm:mb-6">

      {/* SEARCH */}
      <div className="w-full sm:flex-1 sm:min-w-[200px]">
        <label className="text-xs font-semibold text-slate-600">
          Buscar
        </label>
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-[12px]" />
          <input
            type="text"
            placeholder="Nombre o codigo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full pl-9 pr-3 py-2.5
              border border-slate-300
              rounded-xl
              text-sm
              placeholder:text-slate-400
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition
              min-h-[44px]
            "
          />
        </div>
      </div>

      {/* CATEGORY & BRANCH - Side by side on mobile */}
      <div className="flex gap-3 w-full sm:w-auto">
        {/* CATEGORY */}
        <div className="flex-1 sm:w-[140px]">
          <label className="text-xs font-semibold text-slate-600">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="
              w-full
              border border-slate-300
              rounded-xl
              text-sm
              py-2.5 px-3
              bg-white
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              min-h-[44px]
            "
          >
            <option value="TODOS">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* BRANCH */}
        <div className="flex-1 sm:w-[140px]">
          <label className="text-xs font-semibold text-slate-600">
            Bodega
          </label>
          <select
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
            className="
              w-full
              border border-slate-300
              rounded-xl
              text-sm
              py-2.5 px-3
              bg-white
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              min-h-[44px]
            "
          >
            <option value="TODAS">Todas</option>
            {branches.map((b) => {
              const name = typeof b === "string" ? b : b.name;
              return <option key={name} value={name}>{name}</option>;
            })}
          </select>
        </div>
      </div>

      {/* LOW STOCK */}
      <div className="flex items-center gap-2 sm:pt-5">
        <input
          id="lowStock"
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
          className="h-5 w-5 accent-blue-600"
        />
        <label htmlFor="lowStock" className="text-xs text-slate-700">
          Solo bajo stock
        </label>
      </div>

    </div>
  );
}