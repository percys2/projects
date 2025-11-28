"use client";

import React, { useEffect, useState } from "react";
import KardexTable from "./kardexTable";
import { exportKardexPDF } from "./utils/exportKardexPDF";
import { exportKardexExcel } from "./utils/exportKardexExcel";
import InventoryEntryModal from "../inventory/components/InventoryEntryModal";
import InventoryExitModal from "../inventory/components/InventoryExitModal";
import InventoryTransferModal from "../inventory/components/InventoryTransferModal";

export default function KardexScreen({ orgSlug }) {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [movementType, setMovementType] = useState("all");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [page, setPage] = useState(0);
  const limit = 50;

  const [error, setError] = useState(null);

  const [entryOpen, setEntryOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [prodRes, branchRes] = await Promise.all([
          fetch("/api/products", { headers: { "x-org-slug": orgSlug } }),
          fetch("/api/branches", { headers: { "x-org-slug": orgSlug } }),
        ]);
        
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData.products || prodData || []);
        }
        if (branchRes.ok) {
          const branchData = await branchRes.json();
          setBranches(branchData.branches || branchData || []);
        }
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    }
    
    if (orgSlug) loadFilters();
  }, [orgSlug]);

  async function loadKardex() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit,
        offset: page * limit,
      });

      if (dateStart) params.append("startDate", dateStart);
      if (dateEnd) params.append("endDate", dateEnd);

      const res = await fetch(`/api/kardex?${params.toString()}`, {
        headers: {
          "x-org-slug": orgSlug,
          "x-product-id": selectedProduct,
          "x-branch-id": selectedBranch,
          "x-movement-type": movementType,
        },
      });

      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Error loading Kardex");

      setMovements(json.data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orgSlug) loadKardex();
  }, [orgSlug, selectedProduct, selectedBranch, movementType, dateStart, dateEnd, page]);

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
    const org = { name: "AgroCentro Nica", ruc: "401-010200-1002D" };

    exportKardexExcel({
      org,
      product: selectedProduct !== "all" ? products.find((p) => p.id === selectedProduct) : null,
      branch: selectedBranch !== "all" ? branches.find((b) => b.id === selectedBranch) : null,
      movements,
      dateStart,
      dateEnd,
    });
  }

  const getSelectedProductData = () => {
    if (selectedProduct === "all") return null;
    const prod = products.find((p) => p.id === selectedProduct);
    if (!prod) return null;
    const br = selectedBranch !== "all" ? branches.find((b) => b.id === selectedBranch) : branches[0];
    return {
      id: prod.id,
      productId: prod.id,
      name: prod.name,
      branch: br?.name || "Sin sucursal",
      branchId: br?.id || "",
      stock: 0,
      cost: 0,
      price: 0,
    };
  };

  const canMakeMovement = selectedProduct !== "all" && selectedBranch !== "all";

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
          branchId: selectedBranch,
          type: "entrada",
          qty: data.qty,
          cost: data.cost,
          price: data.price,
          expiresAt: data.expiresAt,
          lot: data.lot,
          notes: data.note || "Entrada desde Kardex",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar entrada");
        return;
      }

      await loadKardex();
      setEntryOpen(false);
    } catch (err) {
      console.error("Entry error:", err);
      alert("Error al registrar entrada");
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
          branchId: selectedBranch,
          type: "salida",
          qty: data.qty,
          notes: data.note || data.reason || "Salida desde Kardex",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar salida");
        return;
      }

      await loadKardex();
      setExitOpen(false);
    } catch (err) {
      console.error("Exit error:", err);
      alert("Error al registrar salida");
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
          from_branch: fromBranchId || selectedBranch,
          to_branch: toBranchId,
          notes: "Traslado desde Kardex",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar traslado");
        return;
      }

      await loadKardex();
      setTransferOpen(false);
    } catch (err) {
      console.error("Transfer error:", err);
      alert("Error al registrar traslado");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-xl shadow-sm">
        <span className="text-sm font-semibold text-slate-700">Movimientos:</span>
        <button
          onClick={() => setEntryOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${canMakeMovement ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          + Entrada
        </button>
        <button
          onClick={() => setExitOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${canMakeMovement ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          - Salida
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          disabled={!canMakeMovement}
          className={`px-3 py-1.5 text-xs rounded-lg ${canMakeMovement ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          Traslado
        </button>
        {!canMakeMovement && (
          <span className="text-[11px] text-slate-500 italic">
            Selecciona un producto y sucursal para hacer movimientos
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white border rounded-xl shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-600">Producto</label>
          <select value={selectedProduct} onChange={(e) => { setPage(0); setSelectedProduct(e.target.value); }} className="w-full p-2 text-xs border rounded-lg">
            <option value="all">Todos</option>
            {products.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Sucursal</label>
          <select value={selectedBranch} onChange={(e) => { setPage(0); setSelectedBranch(e.target.value); }} className="w-full p-2 text-xs border rounded-lg">
            <option value="all">Todas</option>
            {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Movimiento</label>
          <select value={movementType} onChange={(e) => { setPage(0); setMovementType(e.target.value); }} className="w-full p-2 text-xs border rounded-lg">
            <option value="all">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
            <option value="transferencia">Transferencias</option>
            <option value="venta">Ventas</option>
            <option value="ajuste">Ajustes</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">Desde</label>
          <input type="date" value={dateStart} onChange={(e) => { setPage(0); setDateStart(e.target.value); }} className="w-full p-2 text-xs border rounded-lg" />
          <label className="text-xs font-semibold text-slate-600 mt-2 block">Hasta</label>
          <input type="date" value={dateEnd} onChange={(e) => { setPage(0); setDateEnd(e.target.value); }} className="w-full p-2 text-xs border rounded-lg" />
        </div>
      </div>

      {loading && <p className="text-center text-slate-500 text-sm">Cargando...</p>}
      {error && <p className="text-center text-red-600 text-sm">{error}</p>}

      {!loading && (
        <KardexTable
          data={movements}
          page={page}
          setPage={setPage}
          limit={limit}
          org={{}}
          product={selectedProduct !== "all" ? products.find((p) => p.id === selectedProduct) : null}
          branch={selectedBranch !== "all" ? branches.find((b) => b.id === selectedBranch) : null}
          onPrint={handlePrint}
          onExportExcel={handleExportExcel}
        />
      )}

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
    </div>
  );
}