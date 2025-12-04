"use client";
import React, { useState } from "react";

export default function InventoryAdjustmentModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}) {
  const [qty, setQty] = useState("");
  const [note, setNote] = useState("");

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">⚙ Ajuste de Inventario</h2>

        <p className="text-sm mb-2">
          Producto: <span className="font-bold">{product.name}</span>
        </p>

        <input
          type="number"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Cantidad (+ o -)"
          className="w-full border rounded-lg p-2 mb-3"
        />

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Motivo del ajuste"
          className="w-full border rounded-lg p-2 mb-3"
        />

        <div className="flex justify-end gap-2">
          <button
            className="px-3 py-1.5 text-xs rounded bg-slate-200"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1.5 text-xs rounded bg-gray-700 text-white"
            onClick={() => onSubmit({ qty, note })}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
