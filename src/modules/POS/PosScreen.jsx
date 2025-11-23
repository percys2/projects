"use client";

import React, { useEffect, useState } from "react";
import  {inventoryService}  from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import PosHeader from "./components/PosHeader";

export default function PosScreen() {
  const branch = useBranchStore((s) => s.activeBranch);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    function load() {
      const data = inventoryService.getInventory(branch);
      setProducts(data);
    }
    load();
  }, [branch]);

  return (
    <div className="grid grid-cols-12 gap-4 h-full">
      {/* HEADER */}
      <div className="col-span-12">
        <PosHeader />
      </div>

      {/* PRODUCTOS */}
      <div className="col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* CARRITO */}
      <div className="col-span-4">
        <CartSidebar />
      </div>
    </div>
  );
}
