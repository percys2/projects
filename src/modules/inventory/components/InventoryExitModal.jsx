"use client";

import React, { useState, useEffect } from "react";

export default function InventoryExitModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}) {
  const [qty, setQty] = useState(0);
  const [branch, setBranch] = useState(product?.branch ?? "Masatepe");
  const [reason, setReason] = useState("Ajuste");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (product) {
      setQty(0);
      setBranch(product.branch ?? "Masatepe");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSave = () => {
    if (qty <= 0) {
      alert("La cantidad debe ser mayor a 0");
      return;
    }

    if (qty > product.stock) {
      alert("No puedes sacar más unidades de las que hay en inventario.");
      return;
    }

    onSubmit({
      productId: product.id,
      qty,
      branch,
      reason,
      note,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Salida de inventario — {product.name}
        </h2>

        <div className="space-y-4 text-sm">

          {/* Cantidad */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Cantidad a descontar
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Stock disponible: {product.stock}
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Motivo
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option>Ajuste</option>
              <option>Merma</option>
              <option>Vencido</option>
              <option>Traslado</option>
              <option>Daño en almacenamiento</option>
              <option>Robo / Pérdida</option>
              <option>Salida manual</option>
            </select>
          </div>

          {/* Sucursal */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Sucursal
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option>Masatepe</option>
              <option>Diriomo</option>
            </select>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: bolsas rotas, producto en mal estado..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-200 rounded text-xs hover:bg-slate-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700"
          >
            Registrar salida
          </button>
        </div>
      </div>
    </div>
  );
}
