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
    <div className="flex flex-wrap items-end gap-4 mb-6">

      {/* SEARCH */}
      <div className="flex-1 min-w-[220px]">
        <label className="text-xs font-semibold text-slate-600">
          Buscar
        </label>
        <div className="relative">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-[10px]" />
          <input
            type="text"
            placeholder="Nombre o código..."
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
            "
          />
        </div>
      </div>

      {/* CATEGORY */}
      <div className="w-[160px]">
        <label className="text-xs font-semibold text-slate-600">
          Categoría
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
          "
        >
          <option value="TODOS">Todas</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* BRANCH */}
      <div className="w-[160px]">
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
          "
        >
          <option value="TODAS">Todas</option>
          {branches.map((b) => {
            const name = typeof b === "string" ? b : b.name;
            return <option key={name} value={name}>{name}</option>;
          })}
        </select>
      </div>

      {/* LOW STOCK */}
      <div className="flex items-center gap-2 pt-5">
        <input
          id="lowStock"
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        <label htmlFor="lowStock" className="text-xs text-slate-700">
          Solo bajo stock
        </label>
      </div>

    </div>
  );
}
