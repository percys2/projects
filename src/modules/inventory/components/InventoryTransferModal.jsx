"use client";

import React, { useEffect, useState } from "react";

export default function InventoryTransferModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  branches = [],
}) {
  const [qty, setQty] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  useEffect(() => {
    if (product) {
      setQty("");
      setFrom(product.branch);
      setFromBranchId(product.branchId || "");
      setTo("");
      setToBranchId("");
      setInvoiceNumber("");
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const handleSubmit = () => {
    const numericQty = Number(qty);
    if (!qty || isNaN(numericQty) || numericQty <= 0) return alert("La cantidad debe ser mayor a 0.");
    if (numericQty > product.stock) return alert("No hay suficiente stock disponible.");
    if (!to) return alert("Selecciona una bodega destino.");
    if (from === to) return alert("La bodega destino debe ser diferente a la origen.");

    onSubmit({
      productId: product.productId || product.id,
      qty: numericQty,
      from,
      to,
      fromBranchId,
      toBranchId,
      invoiceNumber: invoiceNumber.trim() || null,
    });

    onClose();
  };

  const handleToChange = (e) => {
    const selectedName = e.target.value;
    setTo(selectedName);
    const branch = branches.find(b => b.name === selectedName);
    setToBranchId(branch?.id || "");
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
          <input
            type="text"
            value={from}
            readOnly
            className="w-full border rounded px-3 py-2 text-sm bg-slate-100"
          />
        </div>

        {/* Destino */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Bodega destino
          </label>
          <select
            value={to}
            onChange={handleToChange}
            className="w-full border rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Seleccionar...</option>
            {branches.filter((b) => b.name !== from).map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Factura / Documento */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            # Factura / Documento (opcional)
          </label>
          <input
            type="text"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Ej: TRF-001, DOC-123"
          />
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