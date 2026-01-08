"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";

export default function MenudeoModal({ orgSlug, onClose }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addMovement = useCashRegisterStore((s) => s.addMovement);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      alert("Ingrese un monto valido");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/pos/menudeo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          amount: numAmount,
          description: description || "Venta de menudeo",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error al registrar menudeo");
      }

      addMovement({
        type: "entrada",
        subtype: "menudeo",
        amount: numAmount,
        description: description || "Venta de menudeo",
      });

      alert(`Menudeo registrado: C$ ${numAmount.toFixed(2)}\nDeuda acumulada: C$ ${data.totalDebt?.toFixed(2) || numAmount.toFixed(2)}`);
      onClose();
    } catch (error) {
      console.error("Error registering menudeo:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value) => {
    return `C$ ${(value || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-purple-700 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-bold">Registrar Menudeo</h2>
          <p className="text-sm text-purple-200">Venta de producto suelto (librado)</p>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <p className="text-sm text-purple-800">
              <strong>Nota:</strong> El menudeo se registra como entrada de efectivo y acumula una deuda que puede facturarse posteriormente.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Monto del Menudeo</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">C$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg text-lg font-bold focus:border-purple-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Descripcion (opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Menudeo de arroz, frijoles..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Entrada a registrar:</span>
                <span className="text-green-700 font-bold text-lg">{formatCurrency(parseFloat(amount))}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || parseFloat(amount) <= 0 || isSubmitting}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                "Registrar Menudeo"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}