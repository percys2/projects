"use client";

import { useState, useEffect } from "react";

export default function CashClosingReport({ orgSlug, onClose }) {
  const [closings, setClosings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [totals, setTotals] = useState({
    totalClosings: 0,
    totalExpected: 0,
    totalCounted: 0,
    totalDifference: 0,
    totalSales: 0,
  });

  const fetchClosings = async () => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      let url = "/api/pos/cash-closings?limit=500";
      if (dateRange.startDate) {
        url += `&startDate=${dateRange.startDate}`;
      }
      if (dateRange.endDate) {
        url += `&endDate=${dateRange.endDate}`;
      }
      const res = await fetch(url, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (data.success) {
        setClosings(data.closings || []);
        
        const closingsList = data.closings || [];
        const totalExpected = closingsList.reduce((sum, c) => sum + (Number(c.expected_total) || 0), 0);
        const totalCounted = closingsList.reduce((sum, c) => sum + (Number(c.counted_amount) || 0), 0);
        const totalDifference = closingsList.reduce((sum, c) => sum + (Number(c.difference) || 0), 0);
        const totalSales = closingsList.reduce((sum, c) => sum + (Number(c.sales_count) || 0), 0);
        
        setTotals({
          totalClosings: closingsList.length,
          totalExpected,
          totalCounted,
          totalDifference,
          totalSales,
        });
      }
    } catch (err) {
      console.error("Error fetching closings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosings();
  }, [orgSlug]);

  const handleFilter = () => {
    fetchClosings();
  };

  const handleClearFilter = () => {
    setDateRange({ startDate: "", endDate: "" });
    setTimeout(() => fetchClosings(), 100);
  };

  const handleThisMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setDateRange({
      startDate: firstDay.toISOString().split("T")[0],
      endDate: lastDay.toISOString().split("T")[0],
    });
    setTimeout(() => fetchClosings(), 100);
  };

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleDateString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-NI", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDifferenceColor = (diff) => {
    if (diff === 0) return "text-green-600";
    if (diff > 0) return "text-blue-600";
    return "text-red-600";
  };

  const getDifferenceText = (diff) => {
    if (diff === 0) return "Cuadrado";
    if (diff > 0) return "Sobrante";
    return "Faltante";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-orange-700 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Reporte de Cierres de Caja</h2>
            <p className="text-sm text-orange-200">
              {dateRange.startDate && dateRange.endDate 
                ? `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
                : "Todos los cierres"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-600 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 bg-slate-50 border-b flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Desde:</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Hasta:</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:border-orange-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleFilter}
            className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700"
          >
            Filtrar
          </button>
          <button
            onClick={handleThisMonth}
            className="px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700"
          >
            Este Mes
          </button>
          {(dateRange.startDate || dateRange.endDate) && (
            <button
              onClick={handleClearFilter}
              className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300"
            >
              Ver Todos
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-white border-b">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total Cierres</p>
            <p className="text-xl font-bold text-slate-800">{totals.totalClosings}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total Ventas</p>
            <p className="text-xl font-bold text-slate-800">{totals.totalSales}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total Esperado</p>
            <p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.totalExpected)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Total Contado</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.totalCounted)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border">
            <p className="text-xs text-slate-500">Diferencia Total</p>
            <p className={`text-xl font-bold ${getDifferenceColor(totals.totalDifference)}`}>
              {totals.totalDifference >= 0 ? "+" : ""}{formatCurrency(totals.totalDifference)}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : closings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="font-medium">No hay cierres de caja</p>
              <p className="text-sm mt-1">Los cierres apareceran aqui cuando se registren.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-100 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-700">Fecha</th>
                  <th className="text-left p-3 font-medium text-slate-700">Hora</th>
                  <th className="text-left p-3 font-medium text-slate-700">Cajero</th>
                  <th className="text-right p-3 font-medium text-slate-700">Ventas</th>
                  <th className="text-right p-3 font-medium text-slate-700">Esperado</th>
                  <th className="text-right p-3 font-medium text-slate-700">Contado</th>
                  <th className="text-right p-3 font-medium text-slate-700">Diferencia</th>
                  <th className="text-center p-3 font-medium text-slate-700">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {closings.map((closing) => (
                  <tr key={closing.id} className="hover:bg-slate-50">
                    <td className="p-3">{formatDate(closing.closing_time)}</td>
                    <td className="p-3">{formatTime(closing.closing_time)}</td>
                    <td className="p-3">{closing.user_name || "Cajero"}</td>
                    <td className="p-3 text-right">{closing.sales_count || 0}</td>
                    <td className="p-3 text-right">{formatCurrency(closing.expected_total)}</td>
                    <td className="p-3 text-right">{formatCurrency(closing.counted_amount)}</td>
                    <td className={`p-3 text-right font-medium ${getDifferenceColor(closing.difference)}`}>
                      {closing.difference >= 0 ? "+" : ""}{formatCurrency(closing.difference)}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        closing.difference === 0 
                          ? "bg-green-100 text-green-700" 
                          : closing.difference > 0 
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                      }`}>
                        {getDifferenceText(closing.difference)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}