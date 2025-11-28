"use client";

import React, { useState } from "react";
import { useInventory } from "./hooks/useInventory";

import InventoryFilters from "./components/InventoryFilters";
import InventoryGrid from "./components/InventoryGrid";
import ProductFormModal from "./components/ProductFormModal";
import InventoryEntryModal from "./components/InventoryEntryModal";
import InventoryExitModal from "./components/InventoryExitModal";
import InventoryTransferModal from "./components/InventoryTransferModal";

export default function InventoryScreen({ orgSlug }) {
  const inv = useInventory(orgSlug);

  /* ============================================================
     ENTRADA
  ============================================================ */
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryProduct, setEntryProduct] = useState(null);

  const openEntry = (product) => {
    setEntryProduct(product);
    setEntryOpen(true);
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
          productId: entryProduct.productId,
          branchId: entryProduct.branchId,
          type: "entrada",
          qty: data.qty,
          cost: data.cost,
          price: entryProduct.price,
          expiresAt: data.expiresAt,
          lot: data.lot,
          notes: data.note || "Entrada manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar entrada");
        return;
      }

      await inv.loadInventory();
    } catch (err) {
      console.error("Entry error:", err);
      alert("Error al registrar entrada");
    }
  };

  /* ============================================================
     SALIDA
  ============================================================ */
  const [exitOpen, setExitOpen] = useState(false);
  const [exitProduct, setExitProduct] = useState(null);

  const openExit = (product) => {
    setExitProduct(product);
    setExitOpen(true);
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
          productId: exitProduct.productId,
          branchId: exitProduct.branchId,
          type: "salida",
          qty: data.qty,
          notes: data.note || "Salida manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar salida");
        return;
      }

      await inv.loadInventory();
    } catch (err) {
      console.error("Exit error:", err);
      alert("Error al registrar salida");
    }
  };

  /* ============================================================
     TRASLADO
  ============================================================ */
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);

  const openTransfer = (product) => {
    setTransferProduct(product);
    setTransferOpen(true);
  };

  const handleTransferSubmit = async ({ productId, qty, from, to, fromBranchId, toBranchId }) => {
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
          from_branch: fromBranchId || from,
          to_branch: toBranchId || to,
          notes: "Traslado entre sucursales",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Error al registrar traslado");
        return;
      }

      await inv.loadInventory();
    } catch (err) {
      console.error("Transfer error:", err);
      alert("Error al registrar traslado");
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */
  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* -------- HEADER -------- */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Inventario</h1>
          <p className="text-xs text-slate-500">
            Control de productos, movimientos, costos y sucursales.
          </p>
        </div>

        <button
          onClick={inv.openNewProduct}
          className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
        >
          + Agregar producto
        </button>
      </div>

      {/* -------- TARJETA PRINCIPAL -------- */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">

        <div className="px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Detalle de inventario</h2>
          <p className="text-[11px] text-slate-500">
            Total productos filtrados: {inv.filteredProducts.length}
          </p>
        </div>

        {/* FILTROS */}
        <div className="px-4 py-3 border-b">
          <InventoryFilters
            search={inv.search}
            setSearch={inv.setSearch}
            category={inv.category}
            setCategory={inv.setCategory}
            branch={inv.branch}
            setBranch={inv.setBranch}
            lowStockOnly={inv.lowStockOnly}
            setLowStockOnly={inv.setLowStockOnly}
          />
        </div>

        {/* TABLA */}
        <div className="px-4 py-3">
          <InventoryGrid
            products={inv.filteredProducts}
            stats={inv.stats}
            onEdit={inv.openEditProduct}
            onDelete={inv.deleteProduct}
            onEntry={openEntry}
            onExit={openExit}
            onTransfer={openTransfer}
            orgSlug={orgSlug}
          />
        </div>
      </div>

      {/* -------- MODALES -------- */}

      <ProductFormModal
        isOpen={inv.isModalOpen}
        onClose={inv.closeModal}
        onSave={inv.saveProduct}
        product={inv.editingProduct}
        categories={["Alimentos", "Medicinas", "Accesorios", "Herramientas", "Otros"]}
        branches={inv.branches}
      />

      <InventoryEntryModal
        isOpen={entryOpen}
        onClose={() => setEntryOpen(false)}
        product={entryProduct}
        onSubmit={handleEntrySubmit}
      />

      <InventoryExitModal
        isOpen={exitOpen}
        onClose={() => setExitOpen(false)}
        product={exitProduct}
        onSubmit={handleExitSubmit}
      />

      <InventoryTransferModal
        isOpen={transferOpen}
        onClose={() => setTransferOpen(false)}
        product={transferProduct}
        onSubmit={handleTransferSubmit}
        branches={inv.branches}
      />
    </div>
  );
}
