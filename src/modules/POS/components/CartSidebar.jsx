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

export default function CartSidebar({ orgSlug }) {
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
      alert(`Venta realizada. Factura: ${sale.invoice}`);

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-md h-full p-3 flex flex-col space-y-3">

      <CustomerHeader />
      <CustomerSelector orgSlug={orgSlug} />
      <CustomerForm orgSlug={orgSlug} />

      {/* PRODUCTOS DEL CARRITO */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
        {cart.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">
            Carrito vacío
          </p>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-slate-500">
                    C$ {item.price} c/u
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 text-xs ml-2"
                  title="Eliminar producto"
                >
                  &times;
                </button>
              </div>
        
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-medium">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="w-6 h-6 bg-slate-200 hover:bg-slate-300 rounded text-xs font-bold"
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
      <div className="border-t pt-3">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>

        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold"
          onClick={handleSale}
        >
          Finalizar Venta
        </button>

        <button
          onClick={clearCart}
          className="w-full mt-2 bg-slate-300 text-slate-800 py-1.5 rounded-lg text-[10px]"
        >
          Vaciar Carrito
        </button>
      </div>
    </div>
  );
}
