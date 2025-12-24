"use client";

import React from "react";
import { formatCurrency } from "../utils/formatters";

export default function SalesKpiCards({ totals, transactionCount }) {
  const marginPercent = totals.totalRevenue > 0 
    ? ((totals.totalMargin / totals.totalRevenue) * 100).toFixed(1) 
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      <div className="bg-white rounded-xl border p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-slate-500">Total Ventas</p>
        <p className="text-base sm:text-xl font-bold text-slate-800">{formatCurrency(totals.totalRevenue)}</p>
        <p className="text-[10px] sm:text-xs text-slate-400">{transactionCount} transacciones</p>
      </div>
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-emerald-600">Ganancia Bruta</p>
        <p className="text-base sm:text-xl font-bold text-emerald-700">{formatCurrency(totals.totalMargin)}</p>
        <p className="text-[10px] sm:text-xs text-emerald-500">{marginPercent}% margen</p>
      </div>
      <div className="bg-red-50 rounded-xl border border-red-200 p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-red-600">Costo Total</p>
        <p className="text-base sm:text-xl font-bold text-red-700">{formatCurrency(totals.totalCost)}</p>
      </div>
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-blue-600">Productos Vendidos</p>
        <p className="text-base sm:text-xl font-bold text-blue-700">{totals.totalItems}</p>
        <p className="text-[10px] sm:text-xs text-blue-400">unidades</p>
      </div>
    </div>
  );
}