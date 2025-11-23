"use client";

import React from "react";
import { paymentMethods } from "../data/paymentMethods";
import { usePosStore } from "../store/usePosStore";

export default function PaymentMethods() {
  const active = usePosStore((s) => s.paymentMethod);
  const setPayment = usePosStore((s) => s.setPaymentMethod);

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm">
      <h3 className="text-sm font-semibold mb-2">Método de Pago</h3>

      <div className="grid grid-cols-3 gap-2">
        {paymentMethods.map((m) => (
          <button
            key={m.id}
            onClick={() => setPayment(m)}
            className={`border rounded-lg p-2 text-xs ${
              active?.id === m.id ? "bg-slate-900 text-white" : ""
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
