"use client";

import React, { useState } from "react";

export default function ManagerPinModal({ onSuccess, onCancel }) {
  const [pin, setPin] = useState("");
  const VALID_PIN = "4321"; // change later to environment variable
  const [discountValue, setDiscountValue] = useState("");

  function handleSubmit() {
    if (pin !== VALID_PIN) {
      alert("PIN incorrecto");
      return;
    }
    onSuccess(Number(discountValue));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-xl w-[350px] shadow-lg">

        <h3 className="text-lg font-bold mb-3">Autorización de Gerente</h3>

        <label className="text-xs">PIN</label>
        <input
          type="password"
          className="w-full border p-2 rounded mb-3"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />

        <label className="text-xs">Descuento (C$)</label>
        <input
          type="number"
          className="w-full border p-2 rounded mb-4"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-2 border rounded">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-2 bg-blue-600 text-white rounded"
          >
            Autorizar
          </button>
        </div>
      </div>
    </div>
  );
}
