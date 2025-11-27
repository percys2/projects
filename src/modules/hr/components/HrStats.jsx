"use client";

import React from "react";

export default function HrStats({ stats }) {
  const { totalEmployees = 0, activeEmployees = 0, totalPayroll = 0 } = stats || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Total Empleados
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-1">
          {totalEmployees}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {activeEmployees} activos
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Nómina Mensual
        </p>
        <p className="text-2xl font-bold text-emerald-600 mt-1">
          C$ {totalPayroll.toLocaleString("es-NI")}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Salarios brutos
        </p>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <p className="text-xs text-slate-500 uppercase tracking-wide">
          Próximo Aguinaldo
        </p>
        <p className="text-2xl font-bold text-indigo-600 mt-1">
          10 Dic
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Fecha límite de pago
        </p>
      </div>
    </div>
  );
}