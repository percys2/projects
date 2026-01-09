"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";

export default function CashClosingHistory({ orgSlug, onClose }) {
  const [closings, setClosings] = useState([]);
  const [branches, setBranches] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState("calendar");
  const [expandedClosing, setExpandedClosing] = useState(null);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!orgSlug) return;
      try {
        const res = await fetch("/api/branches", {
          headers: { "x-org-slug": orgSlug },
        });
        const data = await res.json();
        const branchMap = {};
        (data.branches || []).forEach(b => {
          branchMap[b.id] = b.name;
        });
        setBranches(branchMap);
      } catch (err) {
        console.error("Error fetching branches:", err);
      }
    };
    fetchBranches();
  }, [orgSlug]);

  const getBranchName = (branchId) => {
    return branches[branchId] || branchId?.slice(0, 8) || "N/A";
  };

  const fetchClosings = async (date) => {
    if (!orgSlug) return;
    setLoading(true);
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/pos/cash-closings?date=${dateStr}`, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (data.success) {
        setClosings(data.closings || []);
      }
    } catch (err) {
      console.error("Error fetching closings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClosings(selectedDate);
  }, [selectedDate, orgSlug]);

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

  const formatDateTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-NI", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleDayClick = (day) => {
    setSelectedDate(day);
    setViewMode("list");
  };

  const getDifferenceColor = (diff) => {
    if (diff === 0) return "text-green-600 bg-green-50";
    if (diff > 0) return "text-blue-600 bg-blue-50";
    return "text-red-600 bg-red-50";
  };

  const getDifferenceText = (diff) => {
    if (diff === 0) return "Cuadrado";
    if (diff > 0) return "Sobrante";
    return "Faltante";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Historial de Cierres de Caja</h2>
            <p className="text-sm text-slate-300">
              {format(selectedDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex border-b">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Calendario
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Cierres del Dia
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {viewMode === "calendar" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: es })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                    {day}
                  </div>
                ))}

                {emptyDays.map((_, index) => (
                  <div key={`empty-${index}`} className="aspect-square" />
                ))}

                {daysInMonth.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square flex items-center justify-center rounded-lg text-sm
                        transition-colors relative
                        ${isSelected ? "bg-emerald-600 text-white" : ""}
                        ${isToday && !isSelected ? "bg-emerald-100 text-emerald-700 font-bold" : ""}
                        ${!isSelected && !isToday ? "hover:bg-slate-100" : ""}
                        ${!isCurrentMonth ? "text-slate-300" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                <p>Selecciona un dia para ver los cierres de caja</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setViewMode("calendar")}
                  className="p-2 hover:bg-slate-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-lg font-semibold">
                  Cierres del {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </h3>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : closings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-medium">No hay cierres para este dia</p>
                  <p className="text-sm mt-1">Selecciona otra fecha en el calendario</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {closings.map((closing) => (
                    <div
                      key={closing.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedClosing(expandedClosing === closing.id ? null : closing.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-left">
                            <p className="font-medium text-slate-800">
                              {getBranchName(closing.branch_id)}
                            </p>
                            <p className="text-sm text-slate-500">
                              {formatTime(closing.opening_time)} - {formatTime(closing.closing_time)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-bold text-slate-800">
                              {formatCurrency(closing.counted_amount)}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getDifferenceColor(closing.difference)}`}>
                              {getDifferenceText(closing.difference)}
                              {closing.difference !== 0 && `: ${formatCurrency(Math.abs(closing.difference))}`}
                            </span>
                          </div>
                          <svg
                            className={`w-5 h-5 text-slate-400 transition-transform ${
                              expandedClosing === closing.id ? "rotate-180" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>

                      {expandedClosing === closing.id && (
                        <div className="border-t bg-slate-50 p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-slate-500">Sucursal</p>
                              <p className="font-medium">{getBranchName(closing.branch_id)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Cajero</p>
                              <p className="font-medium">{closing.user_name || "N/A"}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Ventas</p>
                              <p className="font-medium">{closing.sales_count || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Apertura</p>
                              <p className="font-medium">{formatDateTime(closing.opening_time)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Cierre</p>
                              <p className="font-medium">{formatDateTime(closing.closing_time)}</p>
                            </div>
                          </div>

                          <div className="border-t pt-3 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-600">Monto de apertura</span>
                              <span className="font-medium">{formatCurrency(closing.opening_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-green-600">
                              <span>+ Entradas (ventas)</span>
                              <span className="font-medium">{formatCurrency(closing.total_entries)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-red-600">
                              <span>- Salidas (retiros)</span>
                              <span className="font-medium">{formatCurrency(closing.total_exits)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold border-t pt-2">
                              <span>Total esperado</span>
                              <span>{formatCurrency(closing.expected_total)}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold">
                              <span>Total contado</span>
                              <span>{formatCurrency(closing.counted_amount)}</span>
                            </div>
                            <div className={`flex justify-between text-sm font-bold p-2 rounded ${getDifferenceColor(closing.difference)}`}>
                              <span>Diferencia</span>
                              <span>
                                {closing.difference === 0 ? "C$ 0.00" : 
                                  (closing.difference > 0 ? "+" : "-") + formatCurrency(Math.abs(closing.difference))}
                              </span>
                            </div>
                          </div>

                          {closing.notes && (
                            <div className="border-t pt-3">
                              <p className="text-sm text-slate-500 mb-1">Notas:</p>
                              <p className="text-sm bg-white p-2 rounded border">{closing.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
