"use client";

import React, { useEffect, useState } from "react";
import { inventoryService } from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import PosHeader from "./components/PosHeader";

export default function PosScreen({ orgSlug }) {
  const branch = useBranchStore((s) => s.activeBranch);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      // Use orgSlug for API call, branch for filtering
      const data = await inventoryService.getInventory(orgSlug, branch);

      // ALWAYS extract array safely
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

      {/* PRODUCTOS */}
      <div className="col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
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
      <div className="col-span-4">
        <CartSidebar orgSlug={orgSlug} />
      </div>
    </div>
  );
}
