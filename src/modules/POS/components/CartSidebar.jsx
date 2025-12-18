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

      // Guardar datos de la venta para imprimir
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

      {/* MODAL IMPRIMIR RECIBO */}
      {showPrintModal && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
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
                className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium"
              >
                No, gracias
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
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