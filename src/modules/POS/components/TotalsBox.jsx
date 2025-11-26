"use client";

import React, { useState } from "react";
import { usePosStore } from "../store/usePosStore";
import { calculateTotals } from "../utils/calculateTotals";
import { formatCurrency } from "../utils/formatCurrency";
import ConfirmSaleModal from "./ConfirmSaleModal";

export default function TotalsBox() {
  const cart = usePosStore((s) => s.cart);
  const checkout = usePosStore((s) => s.checkout);

  const totals = calculateTotals(cart);
  const [isFinishing, setIsFinishing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleConfirmSale(paymentData) {
    try {
      setIsFinishing(true);

      // Ejecuta la venta en la store
      await checkout(paymentData);

      setModalOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <>
      {/* === BOX === */}
      <div className="bg-white p-4 border rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Totales</h3>

        <div className="text-xs space-y-1">
          <p>Subtotal: {formatCurrency(totals.subtotal)}</p>
          <p>IVA (15%): {formatCurrency(totals.tax)}</p>

          <p className="font-semibold text-sm mt-2">
            Total: {formatCurrency(totals.total)}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          disabled={isFinishing || cart.length === 0}
          className={`mt-4 w-full text-xs py-2 rounded-lg font-semibold
            ${isFinishing || cart.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"}
          `}
        >
          {isFinishing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l-3 3 3 3v4a8 8 0 01-8-8z"
                ></path>
              </svg>
              Procesando...
            </span>
          ) : (
            "Finalizar Venta"
          )}
        </button>
      </div>

      {/* === CONFIRMATION MODAL === */}
      <ConfirmSaleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirmSale}
        cart={cart}
      />
    </>
  );
}
