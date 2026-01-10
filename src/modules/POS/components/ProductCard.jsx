
"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";
import { useBranchStore } from "../store/useBranchStore";

export default function ProductCard({ product }) {
  const addToCart = usePosStore((s) => s.addToCart);
  const branch = useBranchStore((s) => s.activeBranch);

  const handleAdd = () => {
    if (!branch) {
      alert("Seleccione una sucursal primero");
      return;
    }
    addToCart(branch, product);
  };

  return (
    <div
      onClick={handleAdd}
      className="bg-white border rounded-md p-2 shadow-sm hover:shadow-md transition cursor-pointer select-none"
    >
      <p className="font-semibold text-[11px] leading-tight">{product.name}</p>
      <p className="text-[9px] text-slate-500">{product.category}</p>
      <p className="mt-1 font-bold text-slate-800 text-xs">C$ {product.price}</p>
      <p className="text-[9px] text-slate-400">Stock: {product.quantity || 0}</p>
      <button
        className="mt-2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded w-full hover:bg-slate-800"
        onClick={(e) => {
          e.stopPropagation();
          handleAdd();
        }}
      >
        Agregar
      </button>
    </div>
  );
}