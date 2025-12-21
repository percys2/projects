"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import KardexTable from "./kardexTable";
import { exportKardexPDF } from "./utils/exportKardexPDF";
import { exportKardexExcel } from "./utils/exportKardexExcel";

import InventoryEntryModal from "../inventory/components/InventoryEntryModal";
import InventoryExitModal from "../inventory/components/InventoryExitModal";
import InventoryTransferModal from "../inventory/components/InventoryTransferModal";
import BulkInventoryModal from "../inventory/components/BulkInventoryModal";

export default function KardexScreen({ orgSlug }) {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [invoiceSearch, setInvoiceSearch] = useState("");

  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [movementType, setMovementType] = useState("all");
  const [search, setSearch] = useState("");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [page, setPage] = useState(0);
  const limit = 50;

  const [error, setError] = useState(null);
  const [productStock, setProductStock] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [prodRes, branchRes] = await Promise.all([
          fetch("/api/products", { headers: { "x-org-slug": orgSlug } }),
          fetch("/api/branches", { headers: { "x-org-slug": orgSlug } }),
        ]);

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || []);
        }
        if (branchRes.ok) {
          const branchData = await branchRes.json();
          setBranches(branchData.branches || []);
        }
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    }

    if (orgSlug) loadFilters();
  }, [orgSlug]);

  const loadKardex = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit,
        offset: page * limit,
      });

      if (dateStart) params.append("startDate", dateStart);
      if (dateEnd) params.append("endDate", dateEnd);

      const searchTerm = invoiceSearch || search;

      const res = await fetch(`/api/kardex?${params.toString()}`, {
        headers: {
          "x-org-slug": orgSlug,
          "x-product-id": selectedProduct,
          "x-branch-id": selectedBranch,
          "x-movement-type": movementType,
          "x-search": searchTerm,
        },
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Error cargando Kardex");

      setMovements(json.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug, selectedProduct, selectedBranch, movementType, search, invoiceSearch, dateStart, dateEnd, page]);

  useEffect(() => {
    if (orgSlug) loadKardex();
  }, [orgSlug, loadKardex]);

  useEffect(() => {
    async function loadProductStock() {
      if (selectedProduct === "all" || !orgSlug) {
        setProductStock([]);
        return;
      }
      try {
        setLoadingStock(true);
        const res = await fetch(`/api/inventory/stock?productId=${selectedProduct}`, {
          headers: { "x-org-slug": orgSlug },
        });
        if (res.ok) {
          const data = await res.json();
          setProductStock(data.stock || []);
        }
      } catch (err) {
        console.error("Error loading product stock:", err);
      } finally {
        setLoadingStock(false);
      }
    }
    loadProductStock();
  }, [selectedProduct, orgSlug]);

  const setDatePreset = (preset) => {
    const today = new Date();
    const formatDate = (d) => d.toISOString().split("T")[0];
    
    switch (preset) {
      case "today":
        setDateStart(formatDate(today));
        setDateEnd(formatDate(today));
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateStart(formatDate(yesterday));
        setDateEnd(formatDate(yesterday));
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        setDateStart(formatDate(weekStart));
        setDateEnd(formatDate(today));
        break;
      case "month":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateStart(formatDate(monthStart));
        setDateEnd(formatDate(today));
        break;
      case "lastMonth":
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setDateStart(formatDate(lastMonthStart));
        setDateEnd(formatDate(lastMonthEnd));
        break;
      case "clear":
        setDateStart("");
        setDateEnd("");
        break;
    }
    setPage(0);
  };

  function handlePrint() {
    const org = {
      name: "AgroCentro Nica",
      ruc: "401-010200-1002D",
      address: "Masatepe, Nicaragua",
      phone: "8888-8888",
    };

    exportKardexPDF({
      org,
      product: selectedProduct !== "all" ? products.find((p) => p.id === selectedProduct) : null,
      branch: selectedBranch !== "all" ? branches.find((b) => b.id === selectedBranch) : null,
      movements,
      dateStart,
      dateEnd,
      userName: "Administrador",
    });
  }

  function handleExportExcel() {
    const org = {
      name: "AgroCentro Nica",
      ruc: "401-010200-1002D",
    };

    exportKardexExcel({
      org,
      product: selectedProduct !== "all" ? products.find((p) => p.id === selectedProduct) : null,
      branch: selectedBranch !== "all" ? branches.find((b) => b.id === selectedBranch) : null,
      movements,
      dateStart,
      dateEnd,
    });
  }

  const canMakeMovement = selectedProduct !== "all" && selectedBranch !== "all";

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const term = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );
  }, [productSearch, products]);

  const aggregatedStock = useMemo(() => {
    const byBranch = new Map();
    productStock.forEach((s) => {
      const bid = s.branch_id ?? "no-branch";
      if (!byBranch.has(bid)) {
        byBranch.set(bid, {
          branch_id: s.branch_id,
          branch_name: s.branch_name,
          stock: 0,
        });
      }
      byBranch.get(bid).stock += Number(s.stock ?? s.qty ?? 0);
    });
    return Array.from(byBranch.values());
  }, [productStock]);

  const getSelectedProductData = () => {
    if (selectedProduct === "all") return null;
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return null;

    return {
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      stock: 0,
      cost: 0,
      price: 0,
      branchId: selectedBranch === "all" ? null : selectedBranch,
    };
  };

  const handleEntrySubmit = async (data) => {
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          productId: data.productId,
          type: "entrada",
          qty: data.qty,
          cost: data.cost,
          notes: data.note || "Entrada desde Kardex",
          branchId: selectedBranch === "all" ? null : selectedBranch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error registrando entrada");
        return;
      }

      await loadKardex();
      setEntryOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error registrando entrada");
    }
  };

  const handleExitSubmit = async (data) => {
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          productId: data.productId,
          type: "salida",
          qty: data.qty,
          notes: data.note || "Salida desde Kardex",
          branchId: selectedBranch === "all" ? null : selectedBranch,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error registrando salida");
        return;
      }

      await loadKardex();
      setExitOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error registrando salida");
    }
  };

  const handleTransferSubmit = async ({ productId, qty, fromBranchId, toBranchId }) => {
    try {
      const res = await fetch("/api/inventory/movements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          productId,
          type: "transferencia",
          qty,
          from_branch: fromBranchId || (selectedBranch === "all" ? null : selectedBranch),
          to_branch: toBranchId,
          notes: "Traslado desde Kardex",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error registrando traslado");
        return;
      }

      await loadKardex();
      setTransferOpen(false);
    } catch (err) {
      console.error(err);
      alert("Error registrando traslado");
    }
  };

  const clearAllFilters = () => {
    setSelectedProduct("all");
    setSelectedBranch("all");
    setMovementType("all");
    setSearch("");
    setInvoiceSearch("");
    setDateStart("");
    setDateEnd("");
    setProductSearch("");
    setPage(0);
  };

  const hasActiveFilters = selectedProduct !== "all" || selectedBranch !== "all" || 
    movementType !== "all" || search || invoiceSearch || dateStart || dateEnd;

  return (
    <div className="space-y-4 p-2 sm:p-4">

      {/* Header con busqueda rapida */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Kardex de Inventario</h1>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por factura #..."
            value={invoiceSearch}
            onChange={(e) => {
              setInvoiceSearch(e.target.value);
              setPage(0);
            }}
            className="flex-1 sm:w-40 p-2 text-xs border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 text-xs rounded-lg border ${showFilters ? 'bg-blue-600 text-white' : 'bg-white hover:bg-slate-50'}`}
          >
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
            >
              Limpiar Todo
            </button>
          )}
        </div>
      </div>

      {/* BOTONES DE MOVIMIENTOS */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-white border rounded-xl shadow-sm">
        <span className="text-xs font-semibold text-slate-700">Movimientos:</span>

        <button
          onClick={() => setEntryOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${
            canMakeMovement
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          + Entrada
        </button>

        <button
          onClick={() => setExitOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${
            canMakeMovement
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          - Salida
        </button>

        <button
          onClick={() => setTransferOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${
            canMakeMovement
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Traslado
        </button>

        <div className="hidden sm:block border-l border-slate-300 h-6 mx-2" />

        <button
          onClick={() => setBulkOpen(true)}
          disabled={selectedBranch === "all"}
          className={`px-3 py-1.5 text-xs rounded-lg ${
            selectedBranch !== "all"
              ? "bg-purple-600 text-white hover:bg-purple-700"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          Mov. Multiple
        </button>

        {!canMakeMovement && (
          <span className="text-[10px] text-amber-600 ml-2">
            Seleccione producto y sucursal
          </span>
        )}
      </div>

      {/* FILTROS RAPIDOS DE FECHA */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 border rounded-xl">
        <span className="text-xs font-semibold text-slate-600">Periodo:</span>
        <button onClick={() => setDatePreset("today")} className={`px-2 py-1 text-xs rounded ${dateStart === new Date().toISOString().split("T")[0] && dateEnd === dateStart ? "bg-emerald-600 text-white" : "bg-white border hover:bg-slate-100"}`}>Hoy</button>
        <button onClick={() => setDatePreset("yesterday")} className="px-2 py-1 text-xs rounded bg-white border hover:bg-slate-100">Ayer</button>
        <button onClick={() => setDatePreset("week")} className="px-2 py-1 text-xs rounded bg-white border hover:bg-slate-100">Esta semana</button>
        <button onClick={() => setDatePreset("month")} className="px-2 py-1 text-xs rounded bg-white border hover:bg-slate-100">Este mes</button>
        <button onClick={() => setDatePreset("lastMonth")} className="px-2 py-1 text-xs rounded bg-white border hover:bg-slate-100">Mes pasado</button>
        {(dateStart || dateEnd) && (
          <>
            <button onClick={() => setDatePreset("clear")} className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200">Limpiar</button>
            <span className="text-xs text-slate-500 ml-2">
              {dateStart && dateEnd ? `${dateStart} - ${dateEnd}` : dateStart || dateEnd}
            </span>
          </>
        )}
      </div>

      {/* FILTROS EXPANDIBLES */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white border rounded-xl shadow-sm">
          <div>
            <label className="text-xs font-semibold text-slate-600">Producto</label>
            <input
              type="text"
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full p-2 mb-1 text-xs border rounded-lg"
            />
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs border rounded-lg"
            >
              <option value="all">Todos ({products.length})</option>
              {filteredProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.sku ? `(${p.sku})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Sucursal</label>
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs border rounded-lg mt-1"
            >
              <option value="all">Todas</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Tipo Movimiento</label>
            <select
              value={movementType}
              onChange={(e) => {
                setMovementType(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs border rounded-lg mt-1"
            >
              <option value="all">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="TRANSFER">Transferencias</option>
              <option value="SALE">Ventas</option>
              <option value="SALE_CANCEL">Anulaciones</option>
              <option value="ADJUSTMENT">Ajustes</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600">Busqueda General</label>
            <input
              type="text"
              placeholder="Producto, referencia, usuario..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="w-full p-2 text-xs border rounded-lg mt-1"
            />
          </div>
        </div>
      )}

      {/* RESUMEN DEL PRODUCTO SELECCIONADO */}
      {selectedProduct !== "all" && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-blue-800">
              Stock: {products.find(p => p.id === selectedProduct)?.name || "Producto"}
            </h3>
            {loadingStock && <span className="text-xs text-blue-500">Cargando...</span>}
          </div>
          {!loadingStock && aggregatedStock.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {aggregatedStock.map((stock) => (
                <div key={stock.branch_id ?? "no-branch"} className="bg-white rounded-lg p-3 border border-blue-100 shadow-sm">
                  <p className="text-xs text-slate-500 truncate">{stock.branch_name || branches.find(b => b.id === stock.branch_id)?.name || "Sin sucursal"}</p>
                  <p className="text-lg font-bold text-blue-700">{stock.stock}</p>
                </div>
              ))}
              <div className="bg-blue-600 rounded-lg p-3 text-white shadow-sm">
                <p className="text-xs opacity-80">Total</p>
                <p className="text-lg font-bold">{aggregatedStock.reduce((sum, s) => sum + s.stock, 0)}</p>
              </div>
            </div>
          ) : !loadingStock ? (
            <p className="text-xs text-slate-500">No hay stock registrado</p>
          ) : null}
        </div>
      )}

      {/* TABLA */}
      {!loading && (
        <KardexTable
          data={movements}
          page={page}
          setPage={setPage}
          limit={limit}
          product={selectedProduct === "all" ? null : products.find((p) => p.id === selectedProduct)}
          branch={selectedBranch === "all" ? null : branches.find((b) => b.id === selectedBranch)}
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      )}

      {error && <p className="text-center text-red-600 text-sm bg-red-50 p-4 rounded-lg">{error}</p>}

      {/* MODALES */}
      <InventoryEntryModal
        isOpen={entryOpen}
        onClose={() => setEntryOpen(false)}
        product={getSelectedProductData()}
        onSubmit={handleEntrySubmit}
      />

      <InventoryExitModal
        isOpen={exitOpen}
        onClose={() => setExitOpen(false)}
        product={getSelectedProductData()}
        onSubmit={handleExitSubmit}
      />

      <InventoryTransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        product={getSelectedProductData()}
        onSubmit={handleTransferSubmit}
        branches={branches}
      />

      <BulkInventoryModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        products={products}
        branches={branches}
        selectedBranch={selectedBranch}
        orgSlug={orgSlug}
        onSuccess={loadKardex}
      />
    </div>
  );
}
