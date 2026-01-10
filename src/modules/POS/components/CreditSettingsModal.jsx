"use client";

import { useState } from "react";
import { formatCurrency } from "../utils/formatCurrency";

export default function CreditSettingsModal({ client, orgSlug, onClose, onSuccess }) {
  const [isCreditClient, setIsCreditClient] = useState(client?.is_credit_client || false);
  const [creditLimit, setCreditLimit] = useState(client?.credit_limit?.toString() || "0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!client) return null;

  const clientName = `${client.first_name || ""} ${client.last_name || ""}`.trim();
  const currentBalance = client.credit_balance || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const limit = Number(creditLimit);
    if (isCreditClient && limit <= 0) {
      setError("El límite de crédito debe ser mayor a 0");
      return;
    }

    if (isCreditClient && limit < currentBalance) {
      setError(`El límite no puede ser menor al saldo actual (${formatCurrency(currentBalance)})`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/credits", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          clientId: client.id,
          isCreditClient,
          creditLimit: isCreditClient ? limit : 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar configuración");
      }

      if (onSuccess) onSuccess(data.client);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="bg-purple-600 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-bold">Configurar Crédito</h2>
          <p className="text-sm text-purple-100">{clientName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {currentBalance > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded text-sm">
              Este cliente tiene un saldo pendiente de {formatCurrency(currentBalance)}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">Cliente de crédito</p>
              <p className="text-xs text-slate-500">Permitir compras a crédito</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isCreditClient}
                onChange={(e) => setIsCreditClient(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {isCreditClient && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Límite de crédito
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">C$</span>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full border rounded-lg pl-10 pr-3 py-2 text-lg"
                  placeholder="0.00"
                  step="100"
                  min={currentBalance}
                  required
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Monto máximo que el cliente puede deber
              </p>
            </div>
          )}

          {isCreditClient && (
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Saldo actual:</span>
                <span className="font-medium text-red-600">{formatCurrency(currentBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Nuevo límite:</span>
                <span className="font-medium">{formatCurrency(Number(creditLimit) || 0)}</span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1">
                <span className="text-slate-600">Disponible:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(Math.max(0, (Number(creditLimit) || 0) - currentBalance))}
                </span>
              </div>
            </div>
          )}

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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
