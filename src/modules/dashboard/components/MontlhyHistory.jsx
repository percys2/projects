"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

export default function MonthlyHistory({ orgSlug }) {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  const loadSnapshots = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/org/snapshots?limit=12", {
        headers: { "x-org-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        setSnapshots(data.snapshots || []);
      }
    } catch (err) {
      console.error("Error loading snapshots:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadSnapshots();
  }, [loadSnapshots]);

  const generateSnapshot = async () => {
    try {
      setGenerating(true);
      const now = new Date();
      const res = await fetch("/api/org/snapshots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          year: now.getFullYear(),
          month: now.getMonth() + 1,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      loadSnapshots();
    } catch (err) {
      alert(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const getMonthName = (month) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months[month - 1] || "";
  };

  const getVariance = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Historial Mensual</h3>
          <p className="text-xs text-slate-500">Estadísticas guardadas por mes</p>
        </div>
        <button
          onClick={generateSnapshot}
          disabled={generating}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${generating ? "animate-spin" : ""}`} />
          {generating ? "Generando..." : "Generar Snapshot"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-slate-400">Cargando historial...</div>
      ) : snapshots.length === 0 ? (
        <div className="text-center py-8 text-slate-400 border rounded-lg">
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay snapshots guardados</p>
          <p className="text-xs mt-1">Genera el primer snapshot del mes actual</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-100 text-xs uppercase text-slate-600">
                <th className="px-4 py-3 text-left">Periodo</th>
                <th className="px-4 py-3 text-right">Ingresos</th>
                <th className="px-4 py-3 text-right">Gastos</th>
                <th className="px-4 py-3 text-right">Utilidad</th>
                <th className="px-4 py-3 text-right">Ventas</th>
                <th className="px-4 py-3 text-right">Clientes</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap, idx) => {
                const prev = snapshots[idx + 1];
                const revenueVar = prev ? getVariance(snap.total_revenue, prev.total_revenue) : null;
                
                return (
                  <tr key={snap.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      {getMonthName(snap.month)} {snap.year}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {formatCurrency(snap.total_revenue)}
                        {revenueVar !== null && (
                          <span className={`text-xs ${revenueVar >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {revenueVar >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">
                      {formatCurrency(snap.total_expenses)}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${snap.net_income >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {formatCurrency(snap.net_income)}
                    </td>
                    <td className="px-4 py-3 text-right">{snap.sales_count}</td>
                    <td className="px-4 py-3 text-right">
                      {snap.clients_count}
                      {snap.new_clients_count > 0 && (
                        <span className="text-xs text-blue-600 ml-1">(+{snap.new_clients_count})</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}