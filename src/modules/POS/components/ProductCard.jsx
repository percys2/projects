"use client";

import React, { memo } from "react";
import { usePosStore } from "../store/usePosStore";

function ProductCardComponent({ product }) {
  const addToCart = usePosStore((s) => s.addToCart);
  
  // PERFORMANCE FIX: Only subscribe to this specific product's cart quantity
  // Instead of subscribing to the entire cart array
  const productId = product.id || product.product_id;
  const inCart = usePosStore((s) => {
    const cartItem = s.cart.find((c) => (c.id || c.product_id) === productId);
    return cartItem ? cartItem.qty : 0;
  });
  
  const availableStock = product.quantity || product.stock || product.current_stock || 0;
  const remainingStock = availableStock - inCart;
  
  const isOutOfStock = availableStock <= 0;
  const canAddMore = remainingStock > 0;

  const handleAdd = (e) => {
    if (e) e.stopPropagation();
    if (!canAddMore) {
      alert("No hay mas stock disponible");
      return;
    }
    addToCart(product);
  };

  return (
    <div
      onClick={canAddMore ? handleAdd : undefined}
      className={`bg-white border rounded-lg p-2 sm:p-3 shadow-sm transition select-none ${
        canAddMore ? "hover:shadow-md cursor-pointer active:scale-[0.98]" : "opacity-60 cursor-not-allowed"
      }`}
    >
      <p className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2">
        {product.name}
      </p>

      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{product.category}</p>

      <p className="mt-1 font-bold text-slate-800 text-sm sm:text-base">
        C$ {product.price}
      </p>

      {/* STOCK DISPONIBLE */}
      <p className={`text-[10px] sm:text-xs mt-1 ${
        isOutOfStock ? "text-red-500" : remainingStock <= 5 ? "text-orange-500" : "text-green-600"
      }`}>
        {isOutOfStock ? "Sin stock" : `Stock: ${remainingStock}`}
        {inCart > 0 && ` (${inCart} en carrito)`}
      </p>

      {/* BOTON */}
      <button
        className={`mt-2 text-xs px-2 py-2 rounded w-full min-h-[36px] font-medium ${
          canAddMore 
            ? "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-700" 
            : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }`}
        onClick={handleAdd}
        disabled={!canAddMore}
      >
        {isOutOfStock ? "Agotado" : canAddMore ? "Agregar" : "Maximo"}
      </button>
    </div>
  );
}

// PERFORMANCE FIX: Memoize the component to prevent unnecessary re-renders
const ProductCard = memo(ProductCardComponent);
export default ProductCard;
