"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";
import CustomerSelector from "./CustomerSelector";
import CustomerHeader from "./CustomerHeader";
import CustomerForm from "./CustomerForm";

import { formatCurrency } from "../utils/formatCurrency";
import { salesService } from "../services/salesService";

import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

export default function CartSidebar({ orgSlug, onClose }) {
  const cart = usePosStore((s) => s.cart);
  const clearCart = usePosStore((s) => s.clearCart);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const decreaseQty = usePosStore((s) => s.decreaseQty);
  const increaseQty = usePosStore((s) => s.increaseQty);
  const client = usePosStore((s) => s.selectedClient);

  const branch = useBranchStore((s) => s.activeBranch);
  const isCashOpen = useCashRegisterStore((s) => s.isOpen);
  const addMovement = useCashRegisterStore((s) => s.addMovement);

  const customerForm = usePosStore((s) => s.customerForm);

  const total = cart.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handleSale = async () => {
    try {
      if (!isCashOpen) {
        alert("Abra la caja antes de vender.");
        return;
      }

      const sale = await salesService.makeSale({
        orgSlug,
        client: client || customerForm,
        cart,
        paymentType: "cash",
        branchId: branch,
      });

      addMovement({
        type: "entrada",
        amount: sale.total,
        description: `Venta ${sale.invoice}`,
        time: new Date(),
      });

      clearCart();
      if (onClose) onClose();
      alert(`Venta realizada. Factura: ${sale.invoice}`);

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-md h-full p-3 flex flex-col space-y-3">
      {/* Mobile close button */}
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="font-semibold text-sm">Carrito</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <CustomerHeader />
      <CustomerSelector orgSlug={orgSlug} />
      <CustomerForm orgSlug={orgSlug} />

      {/* PRODUCTOS DEL CARRITO */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 min-h-[100px] max-h-[40vh] lg:max-h-none">
        {cart.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Carrito vacio
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    C$ {item.price} c/u
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2 p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
                  title="Eliminar producto"
                >
                  &times;
                </button>
              </div>
        
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-medium">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="w-8 h-8 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-800">
                  {formatCurrency(item.qty * item.price)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* TOTAL + ACCIONES */}
      <div className="border-t pt-3 flex-shrink-0 pb-safe">
        <div className="flex justify-between text-sm font-bold mb-3">
          <span>Total</span>
          <span className="text-lg">{formatCurrency(total)}</span>
        </div>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-sm font-semibold min-h-[48px]"
          onClick={handleSale}
        >
          Finalizar Venta
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-2 bg-slate-300 text-slate-800 py-2 rounded-lg text-xs min-h-[40px]"
        >
          Vaciar Carrito
        </button>
      </div>
    </div>
  );
}