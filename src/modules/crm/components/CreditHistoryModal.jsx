"use client";

import React, { useState, useEffect } from "react";

export default function CreditHistoryModal({ isOpen, onClose, client, orgSlug }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (isOpen && client?.id) {
      loadHistory();
    }
  }, [isOpen, client?.id]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/credits?clientId=${client.id}`, {
        headers: { "x-org-slug": orgSlug },
      });
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const available = (client.credit_limit || 0) - (client.credit_balance || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-purple-50">
          <div>
            <h2 className="font-bold text-lg text-purple-900">Historial de Crédito</h2>
            <p className="text-sm text-purple-700">{client.first_name} {client.last_name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <div className="p-4 bg-purple-50/50 border-b">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500">Límite de Crédito</p>
              <p className="text-lg font-bold text-slate-800">{formatCurrency(client.credit_limit)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500">Saldo Actual</p>
              <p className={`text-lg font-bold ${(client.credit_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(client.credit_balance)}
              </p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-slate-500">Disponible</p>
              <p className={`text-lg font-bold ${available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(available)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Cargando historial...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              No hay transacciones de crédito registradas
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="text-left p-2 font-medium text-slate-600">Fecha</th>
                  <th className="text-left p-2 font-medium text-slate-600">Tipo</th>
                  <th className="text-left p-2 font-medium text-slate-600">Descripción</th>
                  <th className="text-right p-2 font-medium text-slate-600">Monto</th>
                  <th className="text-right p-2 font-medium text-slate-600">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-slate-50">
                    <td className="p-2 text-slate-500 text-xs">{formatDate(tx.created_at)}</td>
                    <td className="p-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.type === 'payment' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type === 'payment' ? 'ABONO' : 'COMPRA'}
                      </span>
                    </td>
                    <td className="p-2 text-slate-600 text-xs">
                      {tx.description || (tx.type === 'payment' ? 'Pago de crédito' : 'Compra a crédito')}
                      {tx.sale_id && <span className="text-slate-400 ml-1">(Venta #{tx.sale_id.slice(0,8)})</span>}
                    </td>
                    <td className={`p-2 text-right font-medium ${
                      tx.type === 'payment' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'payment' ? '-' : '+'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-2 text-right font-medium text-slate-700">
                      {formatCurrency(tx.balance_after)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
