"use client";

import { useState, useEffect } from "react";

export default function DailySalesDetail({ orgSlug, onClose }) {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({
    totalSales: 0,
    totalAmount: 0,
    totalItems: 0,
    cashAmount: 0,
    transferAmount: 0,
  });

  const fetchTodaySales = async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
      const res = await fetch(`/api/sales?date=${today}`, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (data.success || data.sales) {
        const salesList = data.sales || [];
        setSales(salesList);
        
        const totalAmount = salesList.reduce((sum, s) => sum + (Number(s.total) || 0), 0);
        const totalItems = salesList.reduce((sum, s) => sum + (s.items?.length || 1), 0);
        const cashAmount = salesList
          .filter(s => s.payment_method === "cash" || s.payment_method === "efectivo")
          .reduce((sum, s) => sum + (Number(s.total) || 0), 0);
        const transferAmount = salesList
          .filter(s => s.payment_method === "transfer" || s.payment_method === "transferencia")
          .reduce((sum, s) => sum + (Number(s.total) || 0), 0);
        
        setTotals({
          totalSales: salesList.length,
          totalAmount,
          totalItems,
          cashAmount,
          transferAmount,
        });
      }
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaySales();
  }, [orgSlug]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      cash: "Efectivo",
      efectivo: "Efectivo",
      transfer: "Transferencia",
      transferencia: "Transferencia",
      credit: "Credito",
      card: "Tarjeta",
    };
    return methods[method] || method || "Efectivo";
  };

  const getPaymentMethodColor = (method) => {
    if (method === "cash" || method === "efectivo") return "bg-green-100 text-green-700";
    if (method === "transfer" || method === "transferencia") return "bg-purple-100 text-purple-700";
    if (method === "credit") return "bg-orange-100 text-orange-700";
    return "bg-slate-100 text-slate-700";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Detalle del Dia</h2>
            <p className="text-sm text-blue-200">
              {new Intl.DateTimeFormat("es-NI", { 
                timeZone: "America/Managua",
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              }).format(new Date())}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 border-b">
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total Ventas</p>
            <p className="text-xl font-bold text-slate-800">{totals.totalSales}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total C$</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.totalAmount)}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Efectivo</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.cashAmount)}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Transferencias</p>
            <p className="text-xl font-bold text-purple-600">{formatCurrency(totals.transferAmount)}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sales.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">No hay ventas hoy</p>
              <p className="text-sm mt-1">Las ventas del dia apareceran aqui.</p>
            </div>
          ) : (
            <div className="divide-y">
              {sales.map((sale, index) => (
                <div key={sale.id || index} className="p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">
                          {sale.factura || `Venta #${sale.id?.slice(0, 8) || index + 1}`}
                        </p>
                        <p className="text-sm text-slate-500">
                          {formatTime(sale.created_at || sale.fecha)} | {sale.client_name || "Cliente General"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatCurrency(sale.total)}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPaymentMethodColor(sale.payment_method)}`}>
                        {getPaymentMethodLabel(sale.payment_method)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-100 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium text-slate-700">TOTAL DEL DIA</span>
            <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totals.totalAmount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}