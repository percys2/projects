import React from "react";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

export default function FinanceReports({ transactions, summary }) {
  // Group by category
  const categoryTotals = transactions.reduce((acc, t) => {
    const key = `${t.category}-${t.type}`;
    if (!acc[key]) {
      acc[key] = {
        category: t.category,
        type: t.type,
        total: 0,
        count: 0,
      };
    }
    acc[key].total += t.amount;
    acc[key].count += 1;
    return acc;
  }, {});

  const categoryData = Object.values(categoryTotals).sort((a, b) => b.total - a.total);

  // Group by month
  const monthlyTotals = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
    });
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 };
    }
    if (t.type === "income") {
      acc[month].income += t.amount;
    } else {
      acc[month].expenses += t.amount;
    }
    return acc;
  }, {});

  const monthlyData = Object.entries(monthlyTotals).map(([month, data]) => ({
    month,
    ...data,
    profit: data.income - data.expenses,
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Resumen General</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 p-4 rounded border">
            <p className="text-xs text-slate-600">Ingresos</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded border">
            <p className="text-xs text-slate-600">Gastos</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded border">
            <p className="text-xs text-slate-600">Utilidad</p>
            <p className={`text-lg font-bold ${summary.netProfit >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatCurrency(summary.netProfit)}
            </p>
          </div>
        </div>
      </div>

      {/* By Category */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Por Categoría</h3>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">Categoría</th>
                <th className="text-left p-3 font-medium">Tipo</th>
                <th className="text-right p-3 font-medium">Transacciones</th>
                <th className="text-right p-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{item.category}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        item.type === "income"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.type === "income" ? "Ingreso" : "Gasto"}
                    </span>
                  </td>
                  <td className="p-3 text-right">{item.count}</td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By Month */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Por Mes</h3>
        <div className="border rounded overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">Mes</th>
                <th className="text-right p-3 font-medium">Ingresos</th>
                <th className="text-right p-3 font-medium">Gastos</th>
                <th className="text-right p-3 font-medium">Utilidad</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((item, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3 capitalize">{item.month}</td>
                  <td className="p-3 text-right text-green-600">
                    {formatCurrency(item.income)}
                  </td>
                  <td className="p-3 text-right text-red-600">
                    {formatCurrency(item.expenses)}
                  </td>
                  <td className={`p-3 text-right font-medium ${item.profit >= 0 ? "text-blue-600" : "text-red-600"}`}>
                    {formatCurrency(item.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
