"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";

export default function ProductCard({ product }) {
  const addToCart = usePosStore((s) => s.addToCart);
  const cart = usePosStore((s) => s.cart);
  
  const availableStock = product.quantity || product.stock || product.current_stock || 0;
  
  const cartItem = cart.find((c) => c.id === product.id);
  const inCart = cartItem ? cartItem.qty : 0;
  const remainingStock = availableStock - inCart;
  
  const isOutOfStock = availableStock <= 0;
  const canAddMore = remainingStock > 0;

  const handleAdd = (e) => {
    if (e) e.stopPropagation();
    if (!canAddMore) {
      alert("No hay más stock disponible");
      return;
    }
    addToCart(product);
  };

  return (
    <div
      onClick={canAddMore ? handleAdd : undefined}
      className={`bg-white border rounded-md p-2 shadow-sm transition select-none ${
        canAddMore ? "hover:shadow-md cursor-pointer" : "opacity-60 cursor-not-allowed"
      }`}
    >
      <p className="font-semibold text-[11px] leading-tight">
        {product.name}
      </p>

      <p className="text-[9px] text-slate-500">{product.category}</p>

      <p className="mt-1 font-bold text-slate-800 text-xs">
        C$ {product.price}
      </p>

      {/* STOCK DISPONIBLE */}
      <p className={`text-[9px] mt-1 ${
        isOutOfStock ? "text-red-500" : remainingStock <= 5 ? "text-orange-500" : "text-green-600"
      }`}>
        {isOutOfStock ? "Sin stock" : `Stock: ${remainingStock}`}
        {inCart > 0 && ` (${inCart} en carrito)`}
      </p>

      {/* BOTÓN */}
      <button
        className={`mt-2 text-[9px] px-2 py-1 rounded w-full ${
          canAddMore 
            ? "bg-slate-900 text-white hover:bg-slate-800" 
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
        onClick={handleAdd}
        disabled={!canAddMore}
      >
        {isOutOfStock ? "Agotado" : canAddMore ? "Agregar" : "Máximo alcanzado"}
      </button>
    </div>
  );
}