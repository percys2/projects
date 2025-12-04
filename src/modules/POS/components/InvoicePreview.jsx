"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";
import { formatCurrency } from "../utils/formatCurrency";

export default function InvoicePreview() {
  const cart = usePosStore((s) => s.cart);
  const customer = usePosStore((s) => s.customer);

  const total = cart.reduce((s, c) => s + c.qty * c.price, 0);

  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm text-xs">
      <h3 className="text-sm font-semibold mb-3">Vista previa</h3>

      <p>
        <strong>Cliente:</strong>{" "}
        {customer ? customer.name : "No seleccionado"}
      </p>

      <ul className="mt-3 space-y-1">
        {cart.map((item) => (
          <li key={item.id}>
            {item.qty} × {item.name} — {formatCurrency(item.qty * item.price)}
          </li>
        ))}
      </ul>

      <p className="mt-3 font-semibold">
        Total: {formatCurrency(total)}
      </p>
    </div>
  );
}
