"use client";

import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

export default function CreditPaymentModal({ client, orgSlug, branchId, onClose, onSuccess }) {
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!client) return null;

  const balance = client.credit_balance || 0;
  const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const paymentAmount = Number(amount);
    if (!paymentAmount || paymentAmount <= 0) {
      setError("Ingrese un monto válido");
      return;
    }

    if (paymentAmount > balance) {
      setError("El monto excede el saldo pendiente");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
          "x-branch-id": branchId || "",
        },
        body: JSON.stringify({
          action: "payment",
          clientId: client.id,
          amount: paymentAmount,
          paymentMethod,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar pago");
      }

      if (onSuccess) onSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayFull = () => {
    setAmount(balance.toString());
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-green-600 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-bold">Registrar Pago de Crédito</h2>
          <p className="text-sm text-green-100">{clientName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Saldo pendiente:</span>
              <span className="font-bold text-red-600">{formatCurrency(balance)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Límite de crédito:</span>
              <span className="font-medium">{formatCurrency(client.credit_limit || 0)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Monto a pagar
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="flex-1 border rounded-lg px-3 py-2 text-lg"
                placeholder="0.00"
                step="0.01"
                min="0"
                max={balance}
                required
              />
              <button
                type="button"
                onClick={handlePayFull}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
              >
                Pagar todo
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Método de pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
              <option value="check">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Agregar nota..."
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
              disabled={loading || !amount}
            >
              {loading ? "Procesando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
