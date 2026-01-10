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
  const branch = useBranchStore((s) => s.activeBranch);
  
  const getCart = usePosStore((s) => s.getCart);
  const clearCart = usePosStore((s) => s.clearCart);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const updateQuantity = usePosStore((s) => s.updateQuantity);
  const client = usePosStore((s) => s.selectedClient);
  const customerForm = usePosStore((s) => s.customerForm);

  const isCashOpen = useCashRegisterStore((s) => s.isCashOpen);
  const addMovement = useCashRegisterStore((s) => s.addMovement);

  const cart = getCart(branch);
  const cashOpen = isCashOpen(branch);

  const total = cart.reduce((acc, item) => acc + (item.qty || 1) * item.price, 0);

  const handleSale = async () => {
    try {
      if (!cashOpen) {
        alert("Abra la caja antes de vender.");
        return;
      }

      const sale = await salesService.makeSale({
        orgSlug,
        client: client || customerForm,
        cart,
        paymentType: "efectivo",
        branchId: branch,
      });

      addMovement(branch, {
        type: "entrada",
        amount: sale.total,
        description: `Venta ${sale.invoice}`,
        time: new Date(),
      });

      clearCart(branch);
      alert(`Venta realizada. Factura: ${sale.invoice}`);

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="bg-white border rounded-xl shadow-md h-full p-3 flex flex-col space-y-3">
      <CustomerHeader />
      <CustomerSelector />
      <CustomerForm />

      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1">
        {cart.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">Carrito vacío</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-xs font-semibold">{item.name}</p>
                  <p className="text-[10px] text-slate-500">C$ {item.price} c/u</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(branch, item.id, Math.max(1, (item.qty || 1) - 1))} className="w-5 h-5 bg-slate-200 rounded text-xs">-</button>
                  <span className="text-xs w-6 text-center">{item.qty || 1}</span>
                  <button onClick={() => updateQuantity(branch, item.id, (item.qty || 1) + 1)} className="w-5 h-5 bg-slate-200 rounded text-xs">+</button>
                  <button onClick={() => removeFromCart(branch, item.id)} className="text-red-500 text-xs ml-2">X</button>
                </div>
              </div>
              <p className="text-xs font-bold text-right mt-1">{formatCurrency((item.qty || 1) * item.price)}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex justify-between text-xs font-bold mb-2">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold disabled:opacity-50" onClick={handleSale} disabled={cart.length === 0}>Finalizar Venta</button>
        <button onClick={() => clearCart(branch)} className="w-full mt-2 bg-slate-300 text-slate-800 py-1.5 rounded-lg text-[10px]" disabled={cart.length === 0}>Vaciar Carrito</button>
      </div>
    </div>
  );
}