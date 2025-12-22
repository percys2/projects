"use client";

import React, { useState, useEffect } from "react";

export default function InventoryEntryModal({
  isOpen,
  onClose,
  product,
  onSubmit,
}) {
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [lot, setLot] = useState("");
  const [note, setNote] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    if (product) {
      setQty("");
      setCost(product.cost ? String(product.cost) : "");
      setExpiresAt(product.expiresAt ?? "");
      setLot(product.lot ?? "");
      setNote("");
      setInvoiceNumber("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSave = () => {
    const numericQty = Number(qty);
    if (!qty || isNaN(numericQty) || numericQty <= 0) {
      alert("Ingrese una cantidad válida mayor a 0");
      return;
    }

    onSubmit({
      productId: product.productId || product.id,
      qty: numericQty,
      cost: cost ? Number(cost) : product.cost,
      expiresAt,
      lot,
      note,
      invoiceNumber: invoiceNumber.trim() || null,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-5 shadow-lg">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Entrada de inventario — {product.name}
        </h2>

        <p className="text-xs text-slate-500 mb-4">
          Sucursal: <span className="font-medium">{product.branch}</span>
        </p>

        <div className="space-y-4 text-sm">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Cantidad a ingresar
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: 100"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Costo unitario (opcional)
            </label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: 25.50"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Fecha de vencimiento (opcional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Lote (opcional)
            </label>
            <input
              type="text"
              value={lot}
              onChange={(e) => setLot(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: LOTE-2024-001"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              # Factura / Documento (opcional)
            </label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: FAC-001, REC-123"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">
              Nota (opcional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: compra nueva, ajuste, proveedor X"
            />
          </div>
        </div>

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