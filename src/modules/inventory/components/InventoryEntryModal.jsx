"use client";

import React, { useState, useEffect } from "react";

export default function InventoryEntryModal({
  isOpen,
  onClose,
  product,
  onSubmit, // función para guardar la entrada
}) {
  const [qty, setQty] = useState(0);
  const [cost, setCost] = useState(product?.cost ?? 0);
  const [expiresAt, setExpiresAt] = useState(product?.expiresAt ?? "");
  const [branch, setBranch] = useState(product?.branch ?? "Masatepe");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (product) {
      setQty(0);
      setCost(product.cost ?? 0);
      setExpiresAt(product.expiresAt ?? "");
      setBranch(product.branch ?? "Masatepe");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSave = () => {
    if (qty <= 0) {
      alert("Ingrese una cantidad válida");
      return;
    }

    onSubmit({
      productId: product.id,
      qty,
      cost,
      expiresAt,
      branch,
      note,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Entrada de inventario — {product.name}
        </h2>

        <div className="space-y-4 text-sm">

          {/* Cantidad */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Cantidad a ingresar
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Costo */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Costo unitario (opcional)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          {/* Fecha de Vencimiento */}
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Fecha de vencimiento
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
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
              placeholder="Ej: compra nueva, ajuste, proveedor X"
            />
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-slate-200 rounded text-xs hover:bg-slate-300"
          >
            Cancelar
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-2 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700"
          >
            Guardar entrada
          </button>
        </div>
      </div>
    </div>
  );
}
