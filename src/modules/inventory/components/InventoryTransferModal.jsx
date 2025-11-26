"use client";

import React, { useEffect, useState } from "react";

export default function InventoryTransferModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}) {
  const [qty, setQty] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const BRANCHES = ["Masatepe", "Diriomo", "Managua", "Granada"];

  useEffect(() => {
    if (product) {
      setQty(0);
      setFrom(product.branch);
      setTo("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = () => {
    if (qty <= 0) return alert("La cantidad debe ser mayor a 0.");
    if (qty > product.stock) return alert("No hay suficiente stock disponible.");
    if (from === to) return alert("La bodega destino debe ser diferente a la origen.");

    onSubmit({
      productId: product.id,
      qty: Number(qty),
      from,
      to,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-5 w-[380px] space-y-4 shadow-xl">

        <h2 className="text-lg font-semibold text-slate-800">
          Traslado de inventario
        </h2>

        <p className="text-sm text-slate-600">
          Producto: <span className="font-semibold">{product.name}</span>
        </p>

        {/* Cantidad */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Cantidad a trasladar
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej: 10"
          />
        </div>

        {/* Origen */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Bodega origen
          </label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Destino */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Bodega destino
          </label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Seleccionar...</option>
            {BRANCHES.filter((b) => b !== from).map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-slate-200 rounded hover:bg-slate-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Transferir
          </button>
        </div>

      </div>
    </div>
  );
}
