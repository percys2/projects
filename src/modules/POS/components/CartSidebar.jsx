"use client";

import React, { useState } from "react";
import { usePosStore } from "../store/usePosStore";
import CustomerSelector from "./CustomerSelector";
import CustomerHeader from "./CustomerHeader";
import CustomerForm from "./CustomerForm";

import { formatCurrency } from "../utils/formatCurrency";
import { salesService } from "../services/salesService";
import { printService } from "../services/printService";

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
  const branches = useBranchStore((s) => s.branches);
  const isCashOpen = useCashRegisterStore((s) => s.isOpen);
  const addMovement = useCashRegisterStore((s) => s.addMovement);

  const customerForm = usePosStore((s) => s.customerForm);

  const [showPrintModal, setShowPrintModal] = useState(false);
  const [lastSale, setLastSale] = useState(null);

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

      const branchObj = branches.find((b) => b.id === branch);
      setLastSale({
        invoice: sale.invoice,
        date: new Date().toLocaleString("es-NI"),
        client_name: client?.name || customerForm?.firstName || "Consumidor Final",
        client_ruc: client?.ruc || "",
        branch_name: branchObj?.name || "Sucursal",
        items: cart.map((p) => ({
          name: p.name,
          qty: p.qty,
          price: p.price,
        })),
        subtotal: total,
        tax: 0,
        total: sale.total,
      });

      clearCart();
      setShowPrintModal(true);

    } catch (error) {
      alert(error.message);
    }
  };

  const handlePrint = async () => {
    if (!lastSale) return;
    try {
      await printService.printTicket(lastSale);
    } catch (err) {
      console.error("Error al imprimir:", err);
      alert("No se pudo imprimir. Verifique la impresora.");
    }
    setShowPrintModal(false);
    setLastSale(null);
    if (onClose) onClose();
  };

  const handleSkipPrint = () => {
    setShowPrintModal(false);
    setLastSale(null);
    if (onClose) onClose();
  };

  return (
    <div className="bg-white border rounded-xl shadow-md h-full p-3 flex flex-col" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
      {/* Mobile Header with Close Button */}
      <div className="flex items-center justify-between lg:hidden mb-3 flex-shrink-0">
        <h2 className="font-bold text-lg">Carrito de Compra</h2>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-100 rounded-lg -mr-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-2">
        <h2 className="font-semibold text-sm">Carrito</h2>
      </div>

      <CustomerHeader />
      <CustomerSelector orgSlug={orgSlug} />
      <CustomerForm orgSlug={orgSlug} />

      {/* Cart Items - Flexible height */}
      <div className="flex-1 overflow-y-auto mt-2 space-y-2 pr-1 min-h-[120px]">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">Carrito vacio</p>
            <p className="text-xs mt-1">Agrega productos para comenzar</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 p-3 rounded-lg border border-slate-200 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-slate-500">
                    C$ {item.price} c/u
                  </p>
                </div>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700 ml-2 p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg hover:bg-red-50"
                  title="Eliminar producto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
        
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-base font-medium">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => increaseQty(item.id)}
                    className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {formatCurrency(item.qty * item.price)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total and Actions - Fixed at bottom */}
      <div className="border-t pt-4 mt-3 flex-shrink-0 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-base font-semibold">Total</span>
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</span>
        </div>

        <button
          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-4 rounded-xl text-base font-bold min-h-[56px] shadow-lg"
          onClick={handleSale}
          disabled={cart.length === 0}
        >
          Finalizar Venta
        </button>

        <button
          onClick={clearCart}
          className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-sm font-medium min-h-[48px]"
          disabled={cart.length === 0}
        >
          Vaciar Carrito
        </button>
      </div>

      {/* Print Receipt Modal */}
      {showPrintModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Venta Completada</h3>
              <p className="text-sm text-slate-600 mt-1">Factura: {lastSale.invoice}</p>
              <p className="text-xl font-bold text-green-600 mt-2">{formatCurrency(lastSale.total)}</p>
            </div>

            <p className="text-sm text-slate-600 text-center mb-4">
              Desea imprimir el recibo?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleSkipPrint}
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium min-h-[48px]"
              >
                No, gracias
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-h-[48px]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
