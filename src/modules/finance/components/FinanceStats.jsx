"use client";

import React from "react";

export default function FinanceStats({ stats }) {
  const {
    totalReceivables = 0,
    totalPayables = 0,
    totalAssets = 0,
    monthlyExpenses = 0,
    cashIn = 0,
    cashOut = 0,
    netCashFlow = 0,
  } = stats || {};

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-[11px]">
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        <p className="text-emerald-600">Por Cobrar</p>
        <p className="text-lg font-semibold text-emerald-700">
          C$ {totalReceivables.toLocaleString("es-NI")}
        </p>
      </div>
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
        <p className="text-red-600">Por Pagar</p>
        <p className="text-lg font-semibold text-red-700">
          C$ {totalPayables.toLocaleString("es-NI")}
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
        <p className="text-blue-600">Activos Fijos</p>
        <p className="text-lg font-semibold text-blue-700">
          C$ {totalAssets.toLocaleString("es-NI")}
        </p>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
        <p className="text-orange-600">Gastos del Mes</p>
        <p className="text-lg font-semibold text-orange-700">
          C$ {monthlyExpenses.toLocaleString("es-NI")}
        </p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
        <p className="text-green-600">Ingresos</p>
        <p className="text-lg font-semibold text-green-700">
          C$ {cashIn.toLocaleString("es-NI")}
        </p>
      </div>
      <div className="bg-rose-50 border border-rose-200 rounded-lg px-3 py-2">
        <p className="text-rose-600">Egresos</p>
        <p className="text-lg font-semibold text-rose-700">
          C$ {cashOut.toLocaleString("es-NI")}
        </p>
      </div>
      <div className={`${netCashFlow >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"} border rounded-lg px-3 py-2`}>
        <p className={netCashFlow >= 0 ? "text-emerald-600" : "text-red-600"}>Flujo Neto</p>
        <p className={`text-lg font-semibold ${netCashFlow >= 0 ? "text-emerald-700" : "text-red-700"}`}>
          C$ {netCashFlow.toLocaleString("es-NI")}
        </p>
      </div>
    </div>
  );
}
