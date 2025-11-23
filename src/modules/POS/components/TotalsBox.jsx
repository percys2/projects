"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";
import { calculateTotals } from "../utils/calculateTotals";
import { formatCurrency } from "../utils/formatCurrency";

export default function TotalsBox({ onFinish }) {
  const cart = usePosStore((s) => s.cart);

  const totals = calculateTotals(cart);

  return (
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
        onClick={onFinish}
        className="mt-4 w-full bg-green-600 text-white text-xs py-2 rounded-lg"
      >
        Finalizar Venta
      </button>
    </div>
  );
}
