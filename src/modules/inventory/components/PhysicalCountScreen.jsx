"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function PhysicalCountScreen({ orgSlug, branches = [], products = [], onClose, onSuccess }) {
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [countItems, setCountItems] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return cats.sort();
  }, [products]);

  const branchProducts = useMemo(() => {
    if (!selectedBranch) return [];
    return products.filter((p) => p.branchId === selectedBranch || p.branch_id === selectedBranch);
  }, [products, selectedBranch]);

  const filteredProducts = useMemo(() => {
    let filtered = branchProducts;
    if (selectedCategory !== "TODAS") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      filtered = filtered.filter(
        (p) => p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term)
      );
    }
    if (showOnlyDifferences) {
      filtered = filtered.filter((p) => {
        const item = countItems.find((i) => i.productId === (p.productId || p.product_id));
        return item && item.countedQty !== null && item.countedQty !== item.expectedQty;
      });
    }
    return filtered;
  }, [branchProducts, selectedCategory, search, showOnlyDifferences, countItems]);

  useEffect(() => {
    if (selectedBranch && branchProducts.length > 0) {
      const items = branchProducts.map((p) => ({
        productId: p.productId || p.product_id,
        productName: p.name,
        sku: p.sku,
        category: p.category,
        expectedQty: p.stock || 0,
        countedQty: null,
        difference: 0,
        reason: "",
        notes: "",
      }));
      setCountItems(items);
    }
  }, [selectedBranch, branchProducts]);

  const handleCountChange = (productId, value) => {
    const numValue = value === "" ? null : Number(value);
    setCountItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const diff = numValue !== null ? numValue - item.expectedQty : 0;
          return { ...item, countedQty: numValue, difference: diff };
        }
        return item;
      })
    );
  };

  const handleReasonChange = (productId, reason) => {
    setCountItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, reason } : item))
    );
  };

  const handleNotesChange = (productId, notes) => {
    setCountItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, notes } : item))
    );
  };

  const setAllCounted = () => {
    setCountItems((prev) =>
      prev.map((item) => ({
        ...item,
        countedQty: item.expectedQty,
        difference: 0,
      }))
    );
  };

  const summary = useMemo(() => {
    const counted = countItems.filter((i) => i.countedQty !== null);
    const withDifference = counted.filter((i) => i.difference !== 0);
    const positive = withDifference.filter((i) => i.difference > 0);
    const negative = withDifference.filter((i) => i.difference < 0);
    const totalPositive = positive.reduce((sum, i) => sum + i.difference, 0);
    const totalNegative = negative.reduce((sum, i) => sum + Math.abs(i.difference), 0);

    return {
      total: countItems.length,
      counted: counted.length,
      pending: countItems.length - counted.length,
      withDifference: withDifference.length,
      positive: positive.length,
      negative: negative.length,
      totalPositive,
      totalNegative,
    };
  }, [countItems]);

  const handleSubmit = async () => {
    if (!selectedBranch) {
      alert("Seleccione una sucursal");
      return;
    }

    const itemsWithDifference = countItems.filter(
      (i) => i.countedQty !== null && i.difference !== 0
    );

    if (itemsWithDifference.some((i) => !i.reason)) {
      alert("Debe especificar una razon para todos los productos con diferencia");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/inventory/counts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          branchId: selectedBranch,
          notes,
          items: countItems.filter((i) => i.countedQty !== null),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar conteo");
      }

      alert("Conteo guardado exitosamente");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const REASONS = [
    { value: "", label: "Seleccionar razon..." },
    { value: "merma", label: "Merma / Deterioro" },
    { value: "danado", label: "Producto danado" },
    { value: "robo", label: "Robo / Perdida" },
    { value: "error_entrada", label: "Error en entrada" },
    { value: "error_salida", label: "Error en salida" },
    { value: "devolucion", label: "Devolucion no registrada" },
    { value: "vencido", label: "Producto vencido" },
    { value: "otro", label: "Otro" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-2xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Conteo Fisico de Inventario</h2>
              <p className="text-xs text-slate-500 mt-1">
                Seleccione una sucursal y registre las cantidades contadas
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
              &times;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Sucursal *</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg"
              >
                <option value="">Seleccionar sucursal...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Categoria</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 text-sm border rounded-lg"
              >
                <option value="TODAS">Todas las categorias</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nombre o codigo..."
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={setAllCounted}
                className="flex-1 px-3 py-2 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Marcar todo OK
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={showOnlyDifferences}
                onChange={(e) => setShowOnlyDifferences(e.target.checked)}
                className="h-4 w-4"
              />
              Solo mostrar diferencias
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-slate-100 border-b text-xs">
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-slate-500">Total</p>
            <p className="text-lg font-bold">{summary.total}</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-slate-500">Contados</p>
            <p className="text-lg font-bold text-blue-600">{summary.counted}</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-slate-500">Pendientes</p>
            <p className="text-lg font-bold text-amber-600">{summary.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-slate-500">Sobrantes</p>
            <p className="text-lg font-bold text-green-600">+{summary.totalPositive}</p>
          </div>
          <div className="bg-white rounded-lg p-2 text-center">
            <p className="text-slate-500">Faltantes</p>
            <p className="text-lg font-bold text-red-600">-{summary.totalNegative}</p>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {!selectedBranch ? (
            <div className="text-center text-slate-400 py-12">
              Seleccione una sucursal para comenzar el conteo
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              No hay productos para mostrar
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map((p) => {
                const item = countItems.find((i) => i.productId === (p.productId || p.product_id));
                if (!item) return null;

                const hasDifference = item.countedQty !== null && item.difference !== 0;

                return (
                  <div
                    key={item.productId}
                    className={`border rounded-lg p-3 ${
                      hasDifference
                        ? item.difference > 0
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                        : item.countedQty !== null
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-slate-500">
                          {item.sku} - {item.category}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-xs text-slate-500">Sistema</p>
                          <p className="text-lg font-bold text-slate-700">{item.expectedQty}</p>
                        </div>

                        <div className="text-center">
                          <p className="text-xs text-slate-500">Contado</p>
                          <input
                            type="number"
                            value={item.countedQty ?? ""}
                            onChange={(e) => handleCountChange(item.productId, e.target.value)}
                            placeholder="-"
                            className="w-20 p-2 text-center text-lg font-bold border rounded-lg"
                            min="0"
                          />
                        </div>

                        <div className="text-center min-w-[60px]">
                          <p className="text-xs text-slate-500">Diferencia</p>
                          <p
                            className={`text-lg font-bold ${
                              item.difference > 0
                                ? "text-green-600"
                                : item.difference < 0
                                ? "text-red-600"
                                : "text-slate-400"
                            }`}
                          >
                            {item.countedQty !== null
                              ? item.difference > 0
                                ? `+${item.difference}`
                                : item.difference
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {hasDifference && (
                      <div className="mt-3 pt-3 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">
                            Razon *
                          </label>
                          <select
                            value={item.reason}
                            onChange={(e) => handleReasonChange(item.productId, e.target.value)}
                            className={`w-full p-2 text-sm border rounded-lg ${
                              !item.reason ? "border-red-300 bg-red-50" : ""
                            }`}
                          >
                            {REASONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 block mb-1">
                            Notas
                          </label>
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleNotesChange(item.productId, e.target.value)}
                            placeholder="Notas adicionales..."
                            className="w-full p-2 text-sm border rounded-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Notas del conteo
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas generales del conteo..."
                className="w-full sm:w-80 p-2 text-sm border rounded-lg"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || summary.counted === 0}
                className={`px-6 py-2 text-sm rounded-lg font-semibold ${
                  submitting || summary.counted === 0
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {submitting ? "Guardando..." : "Guardar Conteo"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
