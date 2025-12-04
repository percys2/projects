"use client";

import { useState, useMemo } from "react";

export default function KardexFilters({
  products = [],
  branches = [],
  selectedProduct,
  setSelectedProduct,
  selectedBranch,
  setSelectedBranch,
  setPage,
}) {
  const [search, setSearch] = useState("");

  // FILTRAR PRODUCTOS POR SEARCH BAR
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, products]);

  return (
    <div className="space-y-3 p-3 bg-white border rounded-lg shadow-sm">

      {/* SEARCH BAR */}
      <div className="flex flex-col">
        <label className="font-semibold text-xs mb-1">Buscar producto</label>
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-2 border rounded-lg text-xs"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* PRODUCTO */}
        <div className="flex flex-col text-xs">
          <label className="font-semibold mb-1">Producto</label>
          <select
            value={selectedProduct || "all"}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedProduct(val === "" ? "all" : String(val));
              setPage(0);
            }}
            className="p-2 border rounded-lg text-xs"
          >
            <option value="all">Todos</option>
            {filteredProducts.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* SUCURSAL */}
        <div className="flex flex-col text-xs">
          <label className="font-semibold mb-1">Sucursal</label>
          <select
            value={selectedBranch || "all"}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedBranch(val === "" ? "all" : String(val));
              setPage(0);
            }}
            className="p-2 border rounded-lg text-xs"
          >
            <option value="all">Todas</option>
            {branches.map((b) => (
              <option key={b.id} value={String(b.id)}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}
