"use client";

import React, { useEffect, useState } from "react";
import { inventoryService } from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";
import { useCashRegisterStore } from "./store/useCashRegisterStore";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import PosHeader from "./components/PosHeader";

export default function PosScreen({ orgSlug }) {
  const branch = useBranchStore((s) => s.activeBranch);
  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const data = await inventoryService.getInventory(orgSlug, branch);

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setProducts(list);
    }
    if (orgSlug) load();
  }, [orgSlug, branch]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* HEADER */}
      <div className="col-span-12">
        <PosHeader />
      </div>

      {/* Mensaje si caja cerrada */}
      {!isOpen && (
        <div className="col-span-12 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            La caja está cerrada. Abre la caja para comenzar a vender.
          </p>
        </div>
      )}

      {/* PRODUCTOS */}
      <div className={`col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 ${!isOpen ? "opacity-50 pointer-events-none" : ""}`}>
        {products.length === 0 ? (
          <p className="text-slate-500 text-sm col-span-full">
            No hay productos para esta bodega ({branch})
          </p>
        ) : (
          products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))
        )}
      </div>

      {/* CARRITO */}
      <div className={`col-span-4 ${!isOpen ? "opacity-50 pointer-events-none" : ""}`}>
        <CartSidebar orgSlug={orgSlug} />
      </div>
    </div>
  );
}