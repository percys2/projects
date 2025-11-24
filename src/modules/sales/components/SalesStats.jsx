import React from "react";

export default function SalesStats({ stats }) {
  const cards = [
    {
      title: "Total Ventas",
      value: stats.totalSales,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ingresos Totales",
      value: `C$ ${stats.totalRevenue.toFixed(2)}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Margen Total",
      value: `C$ ${stats.totalMargin.toFixed(2)}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Margen Promedio",
      value: `${(stats.averageMargin * 100).toFixed(1)}%`,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
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
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
        </div>
      ))}
    </div>
  );
}
