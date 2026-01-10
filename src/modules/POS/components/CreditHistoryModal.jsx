"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "../utils/formatCurrency";

export default function CreditHistoryModal({ client, orgSlug, onClose, onPayment }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(client);

  const clientName = `${clientData?.first_name || ""} ${clientData?.last_name || ""}`.trim();

  useEffect(() => {
    loadTransactions();
  }, [client?.id]);

  const loadTransactions = async () => {
    if (!client?.id) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/credits?clientId=${client.id}`, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      setTransactions(data.transactions || []);
      if (data.client) {
        setClientData(data.client);
      }
    } catch (err) {
      console.error("Error loading credit history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="bg-blue-600 text-white p-4 rounded-t-xl">
          <h2 className="text-lg font-bold">Historial de Crédito</h2>
          <p className="text-sm text-blue-100">{clientName}</p>
        </div>

        <div className="p-4 border-b bg-slate-50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Límite</p>
              <p className="font-bold text-slate-800">{formatCurrency(clientData?.credit_limit || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Saldo</p>
              <p className="font-bold text-red-600">{formatCurrency(clientData?.credit_balance || 0)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Disponible</p>
              <p className="font-bold text-green-600">
                {formatCurrency((clientData?.credit_limit || 0) - (clientData?.credit_balance || 0))}
              </p>
            </div>
          </div>

          {(clientData?.credit_balance || 0) > 0 && (
            <button
              onClick={() => onPayment && onPayment(clientData)}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
            >
              Registrar Pago
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-500">Cargando historial...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No hay transacciones</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-lg border ${
                    tx.type === "payment" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {tx.type === "payment" ? "Pago recibido" : "Compra a crédito"}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(tx.created_at)}</p>
                      {tx.notes && <p className="text-xs text-slate-600 mt-1">{tx.notes}</p>}
                      {tx.sale_id && (
                        <p className="text-xs text-slate-500">Venta #{tx.sale_id.slice(0, 8)}</p>
                      )}
                      {tx.payment_method && tx.type === "payment" && (
                        <p className="text-xs text-slate-500">
                          Método: {tx.payment_method === "cash" ? "Efectivo" : 
                                   tx.payment_method === "transfer" ? "Transferencia" :
                                   tx.payment_method === "card" ? "Tarjeta" : tx.payment_method}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === "payment" ? "text-green-600" : "text-red-600"}`}>
                        {tx.type === "payment" ? "-" : "+"}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-slate-500">
                        Saldo: {formatCurrency(tx.balance_after)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
