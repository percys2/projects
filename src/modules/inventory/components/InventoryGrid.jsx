"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useIsDesktop, useMediaQuery } from "@/src/hooks/useMediaQuery";

function computeDaysToExpire(expiresAt) {
  if (!expiresAt) return null;
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const exp = new Date(expiresAt + "T00:00:00");
  return Math.ceil((exp - base) / (1000 * 60 * 60 * 24));
}

function ActionMenu({ product, onKardex, onEntry, onExit, onTransfer, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onKardex(product)}
          className="px-2 py-1.5 text-[11px] bg-purple-600 text-white rounded hover:bg-purple-700 font-medium"
        >
          Historial
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-2 py-1.5 text-[11px] bg-slate-700 text-white rounded hover:bg-slate-800"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
          <button
            onClick={() => { onEntry && onEntry(product); setIsOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 text-emerald-700 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Entrada
          </button>
          <button
            onClick={() => { onExit && onExit(product); setIsOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs hover:bg-orange-50 text-orange-700 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            Salida
          </button>
          <button
            onClick={() => { onTransfer && onTransfer(product); setIsOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 text-blue-700 flex items-center gap-2"
          >
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Traslado
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button
            onClick={() => { onEdit && onEdit(product); setIsOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 text-slate-700 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => { onDelete(product); setIsOpen(false); }}
            className="w-full px-3 py-2 text-left text-xs hover:bg-red-50 text-red-700 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
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
  const isDesktop = useIsDesktop();
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  
  const safeProducts = Array.isArray(products) ? products : [];
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const getStock = (p) => p.stock ?? p.quantity ?? 0;
  const getUnitWeight = (p) =>
    p.unitWeight ?? p.unidad_medida ?? p.unit_medida ?? 0;

  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

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

  const toggleRowExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return (
      <span className="ml-1 text-blue-600">
        {sortConfig.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="space-y-4">

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">
              Confirmar eliminacion
            </h3>

            <p className="text-slate-600 my-4">
              Eliminar <strong>{deleteConfirm.name}</strong>? Esta accion es permanente.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-200 rounded min-h-[48px]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded min-h-[48px]"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE CONFIRM MODAL */}
      {deactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">
              Producto con historial
            </h3>

            <p className="text-slate-600 my-4">
              <strong>{deactivateConfirm.name}</strong> tiene movimientos historicos y no puede eliminarse.
              Desea desactivarlo en su lugar? El producto no aparecera en las listas pero su historial se conservara.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeactivateConfirm(null)}
                className="flex-1 px-4 py-3 bg-slate-200 rounded min-h-[48px]"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeactivate}
                className="flex-1 px-4 py-3 bg-amber-600 text-white rounded min-h-[48px]"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-slate-500 font-medium">Productos</p>
          <p className="text-xl font-bold text-slate-800">{totalProducts}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-blue-600 font-medium">Unidades</p>
          <p className="text-xl font-bold text-blue-800">
            {totalUnits.toLocaleString("es-NI")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-emerald-600 font-medium">Valor inventario</p>
          <p className="text-xl font-bold text-emerald-800">
            C$ {inventoryValue.toLocaleString("es-NI")}
          </p>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-xs text-indigo-600 font-medium">Potencial de venta</p>
          <p className="text-xl font-bold text-indigo-800">
            C$ {potentialRevenue.toLocaleString("es-NI")}
          </p>
        </div>
      </div>

      {/* MOBILE CARDS VIEW */}
      {!isDesktop && (
      <div className="space-y-3">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-slate-400">No hay productos</p>
          </div>
        ) : (
          sortedProducts.map((p) => {
            const stock = getStock(p);
            const costTotal = stock * (p.cost ?? 0);
            const isExpanded = expandedRow === p.id;
            const daysToExpire = computeDaysToExpire(p.expiresAt);
            const isLowStock = stock <= 10;
            const isExpiringSoon = daysToExpire !== null && daysToExpire <= 30;

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleRowExpand(p.id)}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-slate-800 truncate">{p.name}</p>
                        {isLowStock && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded font-medium shrink-0">
                            Bajo
                          </span>
                        )}
                        {isExpiringSoon && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-red-100 text-red-700 rounded font-medium shrink-0">
                            Vence
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        <span className="px-1.5 py-0.5 bg-slate-100 rounded mr-1">{p.category || "Sin categoria"}</span>
                        <span className="text-slate-400">en</span>
                        <span className="ml-1 font-medium">{p.branch ?? p.branch_name}</span>
                      </p>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Stock</span>
                          <span className={`text-sm font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                            {stock.toLocaleString("es-NI")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">Precio</span>
                          <span className="text-sm font-bold text-emerald-700">
                            C${(p.price ?? 0).toLocaleString("es-NI")}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <svg 
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Codigo</span>
                          <span className="text-xs font-mono font-medium text-slate-700">{p.sku ?? p.id?.slice(0, 8)}</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Costo</span>
                          <span className="text-xs font-medium text-slate-700">C${(p.cost ?? 0).toLocaleString("es-NI")}</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Costo Total</span>
                          <span className="text-xs font-medium text-slate-700">C${costTotal.toLocaleString("es-NI")}</span>
                        </div>
                        <div className="bg-white rounded-lg p-2.5 border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wide block">Vencimiento</span>
                          <span className={`text-xs font-medium ${isExpiringSoon ? 'text-red-600' : 'text-slate-700'}`}>
                            {p.expiresAt ? `${daysToExpire}d` : "-"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); onKardex(p); }}
                          className="px-3 py-2.5 text-xs bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                          Historial
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEntry && onEntry(p); }}
                          className="px-3 py-2.5 text-xs bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                          Entrada
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onExit && onExit(p); }}
                          className="px-3 py-2.5 text-xs bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                        >
                          Salida
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onTransfer && onTransfer(p); }}
                          className="px-3 py-2.5 text-xs bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                          Traslado
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit && onEdit(p); }}
                          className="px-3 py-2.5 text-xs bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(p); }}
                          className="px-3 py-2.5 text-xs bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      )}

      {/* DESKTOP TABLE */}
      {isDesktop && (
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-slate-200">
                <th 
                  onClick={() => handleSort("name")}
                  className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 min-w-[180px]"
                >
                  Producto <SortIcon columnKey="name" />
                </th>
                <th 
                  onClick={() => handleSort("sku")}
                  className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                >
                  Codigo <SortIcon columnKey="sku" />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell">
                  Categoria
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Bodega
                </th>
                <th 
                  onClick={() => handleSort("stock")}
                  className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-24"
                >
                  Cantidad <SortIcon columnKey="stock" />
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider hidden 2xl:table-cell w-20">
                  Peso
                </th>
                <th 
                  onClick={() => handleSort("cost")}
                  className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-28"
                >
                  Costo <SortIcon columnKey="cost" />
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell w-28">
                  Costo Total
                </th>
                <th 
                  onClick={() => handleSort("price")}
                  className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100 w-28"
                >
                  Precio <SortIcon columnKey="price" />
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider hidden 2xl:table-cell w-28">
                  Precio/lb
                </th>
                <th className="px-3 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider hidden xl:table-cell w-20">
                  Vence
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <span>No hay productos</span>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p, index) => {
                  const stock = getStock(p);
                  const weight = getUnitWeight(p);
                  const pricePerLb = p.price && weight ? p.price / weight : null;
                  const costTotal = stock * (p.cost ?? 0);
                  const daysToExpire = computeDaysToExpire(p.expiresAt);
                  const isLowStock = stock <= 10;
                  const isExpiringSoon = daysToExpire !== null && daysToExpire <= 30;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800 truncate max-w-[200px]" title={p.name}>
                            {p.name}
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-700 rounded font-medium">
                              Bajo
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-mono text-xs">
                        {p.sku ?? p.id?.slice(0, 8)}
                      </td>
                      <td className="px-3 py-3 text-slate-600 hidden xl:table-cell">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                          {p.category || "-"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {p.branch ?? p.branch_name}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold tabular-nums">
                        <span className={isLowStock ? 'text-amber-600' : 'text-slate-800'}>
                          {stock.toLocaleString("es-NI")}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600 tabular-nums hidden 2xl:table-cell">
                        {weight || "-"}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                        C${(p.cost ?? 0).toLocaleString("es-NI")}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap hidden xl:table-cell">
                        C${costTotal.toLocaleString("es-NI")}
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-emerald-700 tabular-nums whitespace-nowrap">
                        C${(p.price ?? 0).toLocaleString("es-NI")}
                      </td>
                      <td className="px-3 py-3 text-right text-slate-600 tabular-nums whitespace-nowrap hidden 2xl:table-cell">
                        {pricePerLb ? `C$${pricePerLb.toFixed(2)}` : "-"}
                      </td>
                      <td className="px-3 py-3 text-right hidden xl:table-cell">
                        {p.expiresAt ? (
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            isExpiringSoon 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {daysToExpire}d
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <ActionMenu
                            product={p}
                            onKardex={onKardex}
                            onEntry={onEntry}
                            onExit={onExit}
                            onTransfer={onTransfer}
                            onEdit={onEdit}
                            onDelete={() => setDeleteConfirm(p)}
                          />
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
      )}
    </div>
  );
}
