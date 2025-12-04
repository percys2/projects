"use client";

import React, { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";
import { calculateTotals } from "../utils/calculateTotals";

const MANAGER_PIN = "4382"; // Cambialo luego

export default function ConfirmSaleModal({ open, onClose, onConfirm, cart }) {
  if (!open) return null;

  const totals = calculateTotals(cart);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("percent");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Mixto
  const [cash, setCash] = useState(0);
  const [card, setCard] = useState(0);
  const [transfer, setTransfer] = useState(0);

  const totalMixed =
    Number(cash) + Number(card) + Number(transfer);

  const [pin, setPin] = useState("");
  const [requirePin, setRequirePin] = useState(false);

  const discountValue =
    discountType === "percent"
      ? (totals.total * discount) / 100
      : discount;

  const finalTotal = totals.total - discountValue;

  const change = paymentMethod === "mixed" ? totalMixed - finalTotal : cash - finalTotal;

  function validatePinIfNeeded() {
    if (discount > 0 || paymentMethod === "mixed") {
      setRequirePin(true);

      if (pin !== MANAGER_PIN) {
        alert("PIN incorrecto");
        return false;
      }
    }
    return true;
  }

  function handleConfirm() {
    if (!validatePinIfNeeded()) return;

    // Validaciones de pago mixto
    if (paymentMethod === "mixed" && totalMixed < finalTotal) {
      alert("El total pagado no alcanza el total de la venta.");
      return;
    }

    onConfirm({
      paymentMethod,
      discount,
      discountType,
      cash,
      card,
      transfer,
      received: paymentMethod === "cash" ? cash : totalMixed,
      change,
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
        <h2 className="text-lg font-bold mb-4 text-slate-800">Confirmar Venta</h2>

        {/* TOTAL */}
        <p className="text-sm text-slate-700 mb-4">
          Total a pagar:{" "}
          <span className="font-bold">{formatCurrency(finalTotal)}</span>
        </p>

        {/* DESCUENTOS */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-slate-600">Descuento</label>
          <div className="flex gap-2 mt-1">
            <input
              type="number"
              value={discount}
              onChange={(e) => {
                setDiscount(Number(e.target.value));
                if (Number(e.target.value) > 0) setRequirePin(true);
              }}
              className="w-20 border rounded p-1 text-xs"
            />
            <select
              value={discountType}
              onChange={(e) => setDiscountType(e.target.value)}
              className="border p-1 rounded text-xs"
            >
              <option value="percent">%</option>
              <option value="amount">C$</option>
            </select>
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <label className="text-xs font-semibold text-slate-600">Método de pago</label>
        <select
          className="w-full border p-2 rounded mt-1 text-xs"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="cash">Efectivo</option>
          <option value="card">Tarjeta</option>
          <option value="transfer">Transferencia</option>
          <option value="mixed">Mixto</option>
        </select>

        {/* PAYMENT FIELDS */}
        <div className="mt-3 space-y-2">
          {paymentMethod === "cash" && (
            <input
              type="number"
              className="w-full border p-2 rounded text-xs"
              placeholder="Efectivo recibido"
              value={cash}
              onChange={(e) => setCash(Number(e.target.value))}
            />
          )}

          {paymentMethod === "mixed" && (
            <>
              <input
                type="number"
                placeholder="Efectivo"
                className="w-full border p-2 rounded text-xs"
                value={cash}
                onChange={(e) => setCash(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Tarjeta"
                className="w-full border p-2 rounded text-xs"
                value={card}
                onChange={(e) => setCard(Number(e.target.value))}
              />
              <input
                type="number"
                placeholder="Transferencia"
                className="w-full border p-2 rounded text-xs"
                value={transfer}
                onChange={(e) => setTransfer(Number(e.target.value))}
              />
            </>
          )}
        </div>

        {/* VUELTO */}
        {(paymentMethod === "cash" || paymentMethod === "mixed") && (
          <p className="text-xs mt-3 text-slate-700">
            Vuelto:{" "}
            <span className="font-semibold">{formatCurrency(change)}</span>
          </p>
        )}

        {/* PIN */}
        {requirePin && (
          <div className="mt-4">
            <label className="text-xs font-semibold text-slate-600">
              PIN Gerente (obligatorio)
            </label>
            <input
              type="password"
              className="w-full border p-2 rounded text-xs"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
            />
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 text-xs bg-slate-200 rounded-lg"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg"
          >
            Confirmar Venta
          </button>
        </div>
      </div>
    </div>
  );
}
