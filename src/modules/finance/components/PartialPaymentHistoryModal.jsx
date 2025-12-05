"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function PartialPaymentHistoryModal({ isOpen, onClose, item, type, orgSlug }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      loadPaymentHistory();
    }
  }, [isOpen, item]);

  const loadPaymentHistory = async () => {
    setLoading(true);
    try {
      // Fetch payments related to this invoice/bill
      const res = await fetch(`/api/finance/payments?reference=${item.id}`, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      
      // Filter payments that match this invoice
      const relatedPayments = (data.payments || []).filter(
        (p) => p.invoice_id === item.id || p.bill_id === item.id || p.reference_id === item.id
      );
      
      setPayments(relatedPayments);
    } catch (err) {
      console.error("Error loading payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = (item?.total || 0) - totalPaid;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Historial de Pagos</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {/* Invoice/Bill Info */}
          <div className="bg-slate-50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-500">
                  {type === "receivables" ? "Cliente:" : "Proveedor:"}
                </span>
                <p className="font-medium">
                  {type === "receivables" ? item?.client_name : item?.supplier_name}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Referencia:</span>
                <p className="font-medium">{item?.factura || item?.reference || "-"}</p>
              </div>
              <div>
                <span className="text-slate-500">Total:</span>
                <p className="font-medium">C$ {(item?.total || 0).toLocaleString("es-NI")}</p>
              </div>
              <div>
                <span className="text-slate-500">Saldo:</span>
                <p className={`font-medium ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                  C$ {balance.toLocaleString("es-NI")}
                </p>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {loading ? (
            <p className="text-center text-slate-500 py-4">Cargando...</p>
          ) : payments.length === 0 ? (
            <p className="text-center text-slate-400 py-4">No hay pagos registrados</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      C$ {(payment.amount || 0).toLocaleString("es-NI")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {payment.date} - {payment.payment_method || "Efectivo"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    payment.direction === "in" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {payment.direction === "in" ? "Cobro" : "Pago"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total pagado:</span>
              <span className="font-bold text-emerald-600">
                C$ {totalPaid.toLocaleString("es-NI")}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}