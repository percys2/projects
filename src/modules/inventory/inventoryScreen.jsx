"use client";

import React, { useState } from "react";
import { useInventory } from "./hooks/useInventory";

import InventoryFilters from "./components/InventoryFilters";
import InventoryGrid from "./components/InventoryGrid";
import ProductFormModal from "./components/ProductFormModal";
import InventoryEntryModal from "./components/InventoryEntryModal";
import InventoryExitModal from "./components/InventoryExitModal";
import InventoryTransferModal from "./components/InventoryTransferModal";

export default function InventoryScreen({ orgId }) {
  const inv = useInventory(orgId);

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
    // actualizar inventario local
    inv.saveProduct({
      ...entryProduct,
      stock: entryProduct.stock + data.qty,
      cost: data.cost ?? entryProduct.cost,
      expiresAt: data.expiresAt ?? entryProduct.expiresAt,
    });

    // registrar movimiento
    await fetch("/api/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        productId: entryProduct.productId,
        branchId: entryProduct.branchId,
        type: "entrada",
        qty: data.qty,
        cost: data.cost,
        expiresAt: data.expiresAt,
        lot: data.lot,
        notes: "Entrada manual",
      }),
    });
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
    inv.saveProduct({
      ...exitProduct,
      stock: exitProduct.stock - data.qty,
    });

    await fetch("/api/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        productId: exitProduct.productId,
        branchId: exitProduct.branchId,
        type: "salida",
        qty: data.qty,
        notes: "Salida manual",
      }),
    });
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

  const handleTransferSubmit = async ({ productId, qty, from, to }) => {
    // actualizar inventario local
    const updated = inv.products.map((p) => {
      if (p.id === productId && p.branch === from)
        return { ...p, stock: p.stock - qty };

      if (p.id === productId && p.branch === to)
        return { ...p, stock: p.stock + qty };

      return p;
    });

    inv.setProducts(updated);

    // registrar movimiento
    await fetch("/api/inventory/movements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgId,
        productId,
        type: "traslado",
        qty,
        from_branch: from,
        to_branch: to,
        notes: "Traslado entre sucursales",
      }),
    });
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
            orgId={orgId} // necesario para KARDEX
          />
        </div>
      </div>

      {/* -------- MODALES -------- */}

      <ProductFormModal
        isOpen={inv.isModalOpen}
        onClose={inv.closeModal}
        onSave={inv.saveProduct}
        product={inv.editingProduct}
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
      />
    </div>
  );
}
