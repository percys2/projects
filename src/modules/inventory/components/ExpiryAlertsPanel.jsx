"use client";

import React, { useMemo } from "react";

function computeDaysToExpire(expiresAt) {
  if (!expiresAt) return null;
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const exp = new Date(expiresAt + "T00:00:00");
  return Math.ceil((exp - base) / (1000 * 60 * 60 * 24));
}

function getExpiryStatus(days) {
  if (days === null) return { status: "no_expiry", label: "Sin vencimiento", color: "slate" };
  if (days < 0) return { status: "expired", label: "Vencido", color: "red" };
  if (days <= 7) return { status: "critical", label: "Critico", color: "red" };
  if (days <= 14) return { status: "warning", label: "Urgente", color: "orange" };
  if (days <= 30) return { status: "attention", label: "Atencion", color: "amber" };
  return { status: "ok", label: "OK", color: "green" };
}

export default function ExpiryAlertsPanel({ products = [], onProductClick }) {
  const expiryData = useMemo(() => {
    const withExpiry = products
      .filter((p) => p.expiresAt)
      .map((p) => {
        const days = computeDaysToExpire(p.expiresAt);
        const status = getExpiryStatus(days);
        const value = (p.stock || 0) * (p.cost || 0);
        return { ...p, daysToExpire: days, expiryStatus: status, valueAtRisk: value };
      })
      .sort((a, b) => (a.daysToExpire ?? 999) - (b.daysToExpire ?? 999));

    const expired = withExpiry.filter((p) => p.daysToExpire !== null && p.daysToExpire < 0);
    const critical = withExpiry.filter((p) => p.daysToExpire !== null && p.daysToExpire >= 0 && p.daysToExpire <= 7);
    const warning = withExpiry.filter((p) => p.daysToExpire !== null && p.daysToExpire > 7 && p.daysToExpire <= 14);
    const attention = withExpiry.filter((p) => p.daysToExpire !== null && p.daysToExpire > 14 && p.daysToExpire <= 30);

    const totalExpiredValue = expired.reduce((sum, p) => sum + p.valueAtRisk, 0);
    const totalCriticalValue = critical.reduce((sum, p) => sum + p.valueAtRisk, 0);
    const totalWarningValue = warning.reduce((sum, p) => sum + p.valueAtRisk, 0);
    const totalAttentionValue = attention.reduce((sum, p) => sum + p.valueAtRisk, 0);

    return {
      expired,
      critical,
      warning,
      attention,
      totalExpiredValue,
      totalCriticalValue,
      totalWarningValue,
      totalAttentionValue,
      totalAtRisk: totalExpiredValue + totalCriticalValue + totalWarningValue,
    };
  }, [products]);

  const hasAlerts = expiryData.expired.length > 0 || expiryData.critical.length > 0 || expiryData.warning.length > 0;

  if (!hasAlerts && expiryData.attention.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden mb-4">
      <div className="px-4 py-3 border-b bg-gradient-to-r from-red-50 to-orange-50">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alertas de Vencimiento
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Valor en riesgo: <span className="font-semibold text-red-600">C$ {expiryData.totalAtRisk.toLocaleString("es-NI")}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium">Vencidos</p>
            <p className="text-xl font-bold text-red-700">{expiryData.expired.length}</p>
            <p className="text-xs text-red-500">C$ {expiryData.totalExpiredValue.toLocaleString("es-NI")}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-600 font-medium">Critico (0-7 dias)</p>
            <p className="text-xl font-bold text-red-700">{expiryData.critical.length}</p>
            <p className="text-xs text-red-500">C$ {expiryData.totalCriticalValue.toLocaleString("es-NI")}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-xs text-orange-600 font-medium">Urgente (8-14 dias)</p>
            <p className="text-xl font-bold text-orange-700">{expiryData.warning.length}</p>
            <p className="text-xs text-orange-500">C$ {expiryData.totalWarningValue.toLocaleString("es-NI")}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-600 font-medium">Atencion (15-30 dias)</p>
            <p className="text-xl font-bold text-amber-700">{expiryData.attention.length}</p>
            <p className="text-xs text-amber-500">C$ {expiryData.totalAttentionValue.toLocaleString("es-NI")}</p>
          </div>
        </div>

        {(expiryData.expired.length > 0 || expiryData.critical.length > 0) && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-600 uppercase">Productos que requieren accion inmediata</h3>
            <div className="max-h-48 overflow-auto">
              {[...expiryData.expired, ...expiryData.critical].map((p) => (
                <div
                  key={p.id}
                  onClick={() => onProductClick?.(p)}
                  className={`flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer hover:opacity-80 transition ${
                    p.daysToExpire < 0 ? "bg-red-100 border border-red-300" : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.branch} - Stock: {p.stock} - Vence: {p.expiresAt}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      p.daysToExpire < 0 ? "bg-red-600 text-white" : "bg-red-500 text-white"
                    }`}>
                      {p.daysToExpire < 0 ? "VENCIDO" : `${p.daysToExpire} dias`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {expiryData.warning.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="text-xs font-semibold text-slate-600 uppercase">Vencen en 8-14 dias</h3>
            <div className="max-h-32 overflow-auto">
              {expiryData.warning.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onProductClick?.(p)}
                  className="flex justify-between items-center p-2 rounded-lg mb-1 cursor-pointer hover:opacity-80 transition bg-orange-50 border border-orange-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500">
                      {p.branch} - Stock: {p.stock}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <span className="text-xs font-bold px-2 py-1 rounded bg-orange-500 text-white">
                      {p.daysToExpire} dias
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}