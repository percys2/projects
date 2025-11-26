"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";

export default function ProductCard({ product }) {
  const addToCart = usePosStore((s) => s.addToCart);

  return (
    <div
      onClick={() => addToCart(product)}
      className="bg-white border rounded-md p-2 shadow-sm hover:shadow-md transition cursor-pointer select-none"
    >
      {/* NOMBRE DEL PRODUCTO */}
      <p className="font-semibold text-[11px] leading-tight">
        {product.name}
      </p>

      {/* CATEGORÍA */}
      <p className="text-[9px] text-slate-500">{product.category}</p>

      {/* PRECIO */}
      <p className="mt-1 font-bold text-slate-800 text-xs">
        C$ {product.price}
      </p>

      {/* BOTÓN (MUY PEQUEÑO) */}
      <button
        className="mt-2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded w-full"
        onClick={(e) => {
          e.stopPropagation();
          addToCart(product);
        }}
      >
        Agregar
      </button>
    </div>
  );
}
