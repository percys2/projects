"use client";

import React, { useState } from "react";
import { useInventory } from "./hooks/useInventory";

import InventoryFilters from "./components/InventoryFilters";
import InventoryGrid from "./components/InventoryGrid";
import ProductFormModal from "./components/ProductFormModal";
import InventoryEntryModal from "./components/InventoryEntryModal";
import InventoryExitModal from "./components/InventoryExitModal";
import InventoryTransferModal from "./components/InventoryTransferModal";

import KardexDrawer from "../kardex/KardexDrawer";

export default function InventoryScreen({ orgSlug }) {
  const inv = useInventory(orgSlug);

  const [kardexOpen, setKardexOpen] = useState(false);
  const [kardexProduct, setKardexProduct] = useState(null);
  const [kardexRefreshKey, setKardexRefreshKey] = useState(0);

  const openKardex = (product) => {
    setKardexProduct(product);
    setKardexOpen(true);
  };

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
          productId: entryProduct.product_id ?? entryProduct.productId,
          branchId: entryProduct.branchId,
          type: "entrada",
          qty: data.qty,
          cost: data.cost,
          price: entryProduct.price,
          expiresAt: data.expiresAt,
          lot: data.lot,
          notes: data.note || "Entrada manual",
          invoiceNumber: data.invoiceNumber || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      await inv.loadInventory();
      setKardexRefreshKey((k) => k + 1);
      setEntryOpen(false);
    } catch (err) {
      alert("Error registrando entrada");
    }
  };

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
          productId: exitProduct.product_id ?? exitProduct.productId,
          branchId: exitProduct.branchId,
          type: "salida",
          qty: data.qty,
          notes: data.note || "Salida manual",
          invoiceNumber: data.invoiceNumber || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      await inv.loadInventory();
      setKardexRefreshKey((k) => k + 1);
      setExitOpen(false);
    } catch (err) {
      alert("Error registrando salida");
    }
  };

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);

  const openTransfer = (product) => {
    setTransferProduct(product);
    setTransferOpen(true);
  };

  const handleTransferSubmit = async ({
    productId,
    qty,
    fromBranchId,
    toBranchId,
    invoiceNumber,
  }) => {
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
          from_branch: fromBranchId,
          to_branch: toBranchId,
          notes: "Traslado entre sucursales",
          invoiceNumber: invoiceNumber || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error);
        return;
      }

      await inv.loadInventory();
      setKardexRefreshKey((k) => k + 1);
      setTransferOpen(false);
    } catch (err) {
      alert("Error registrando traslado");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 max-w-6xl mx-auto px-2 sm:px-0">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-lg font-semibold">Inventario</h1>
          <p className="text-xs text-slate-500">
            Control por producto, movimientos y sucursales.
          </p>
        </div>

        <button
          onClick={inv.openNewProduct}
          className="w-full sm:w-auto px-3 py-2 bg-slate-900 text-white rounded-lg text-xs min-h-[44px]"
        >
          + Agregar producto
        </button>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-3 sm:px-4 py-3 border-b">
          <h2 className="font-semibold text-sm">Detalle de inventario</h2>
          <p className="text-[11px] text-slate-500">
            Total filtrados: {inv.filteredProducts.length}
          </p>
        </div>

        <div className="px-3 sm:px-4 py-3 border-b">
          <InventoryFilters
            search={inv.search}
            setSearch={inv.setSearch}
            category={inv.category}
            setCategory={inv.setCategory}
            branch={inv.branch}
            setBranch={inv.setBranch}
            lowStockOnly={inv.lowStockOnly}
            setLowStockOnly={inv.setLowStockOnly}
            categories={inv.categories}
            branches={inv.branches}
          />
        </div>

        <div className="px-2 sm:px-4 py-3">
          <InventoryGrid
            products={inv.filteredProducts}
            stats={inv.stats}
            onEdit={inv.openEditProduct}
            onDelete={inv.deleteProduct}
            onToggleActive={inv.toggleProductActive}
            onEntry={openEntry}
            onExit={openExit}
            onTransfer={openTransfer}
            onKardex={openKardex}
            orgSlug={orgSlug}
          />
        </div>
      </div>

      <KardexDrawer
        open={kardexOpen}
        onClose={() => setKardexOpen(false)}
        product={kardexProduct}
        orgSlug={orgSlug}
        refreshKey={kardexRefreshKey}
      />

      <ProductFormModal
        isOpen={inv.isModalOpen}
        onClose={inv.closeModal}
        onSave={inv.saveProduct}
        product={inv.editingProduct}
        categories={inv.categories}
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

