import React from "react";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

export default function FinanceSummaryCards({ summary }) {
  const cards = [
    {
      title: "Ingresos Totales",
      value: summary.totalIncome,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Gastos Totales",
      value: summary.totalExpenses,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Utilidad Neta",
      value: summary.netProfit,
      color: summary.netProfit >= 0 ? "text-blue-600" : "text-red-600",
      bgColor: summary.netProfit >= 0 ? "bg-blue-50" : "bg-red-50",
    },
    {
      title: "Transacciones",
      value: summary.transactionCount,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      isCount: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.bgColor} rounded-lg p-4 border border-slate-200`}
        >
          <p className="text-xs text-slate-600 mb-1">{card.title}</p>
          <p className={`text-2xl font-bold ${card.color}`}>
            {card.isCount ? card.value : formatCurrency(card.value)}
          </p>
        </div>
      ))}
    </div>
  );
}
