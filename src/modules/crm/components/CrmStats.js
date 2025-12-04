"use client";

import React from "react";

export default function CrmStats({ stats }) {
  const {
    totalOpportunities = 0,
    totalPipelineValue = 0,
    conversionRate = 0,
    closingThisWeek = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Oportunidades Abiertas
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {totalOpportunities}
        </p>
        <p className="text-xs text-slate-400 mt-1">en pipeline</p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Valor Total Pipeline
        </p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
          C$ {totalPipelineValue.toLocaleString("es-NI")}
        </p>
        <p className="text-xs text-slate-400 mt-1">potencial de ventas</p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Tasa de Cierre
        </p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">
          {conversionRate}%
        </p>
        <p className="text-xs text-slate-400 mt-1">últimos 30 días</p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Próximos Cierres
        </p>
        <p className="text-2xl font-bold text-amber-600 mt-1">
          {closingThisWeek}
        </p>
        <p className="text-xs text-slate-400 mt-1">esta semana</p>
      </div>
    </div>
  );
}