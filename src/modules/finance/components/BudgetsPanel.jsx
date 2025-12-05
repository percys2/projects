"use client";

import { useState, useMemo } from "react";
import { PieChart, Target, TrendingUp, AlertTriangle } from "lucide-react";

export default function BudgetsPanel({ accounts, expenses, orgSlug }) {
  const [budgets, setBudgets] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [budgetInput, setBudgetInput] = useState("");

  // Get expense categories from accounts
  const expenseCategories = useMemo(() => {
    return accounts
      .filter((a) => a.type === "expense")
      .map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
      }));
  }, [accounts]);

  // Calculate actual spending per category
  const actualSpending = useMemo(() => {
    const spending = {};
    const currentMonth = new Date().toISOString().slice(0, 7);

    expenses.forEach((e) => {
      if (!e.date?.startsWith(currentMonth)) return;
      
      const categoryId = e.account_id || e.category_id || "uncategorized";
      spending[categoryId] = (spending[categoryId] || 0) + (e.total || 0);
    });

    return spending;
  }, [expenses]);

  // Calculate budget data
  const budgetData = useMemo(() => {
    return expenseCategories.map((cat) => {
      const budget = budgets[cat.id] || 0;
      const actual = actualSpending[cat.id] || 0;
      const variance = budget - actual;
      const percentUsed = budget > 0 ? (actual / budget) * 100 : 0;

      return {
        ...cat,
        budget,
        actual,
        variance,
        percentUsed,
        status: percentUsed > 100 ? "over" : percentUsed > 80 ? "warning" : "ok",
      };
    });
  }, [expenseCategories, budgets, actualSpending]);

  const totalBudget = budgetData.reduce((sum, b) => sum + b.budget, 0);
  const totalActual = budgetData.reduce((sum, b) => sum + b.actual, 0);

  const handleSaveBudget = (categoryId) => {
    setBudgets((prev) => ({
      ...prev,
      [categoryId]: parseFloat(budgetInput) || 0,
    }));
    setEditingCategory(null);
    setBudgetInput("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800">Presupuestos por Categoría</h3>
        </div>
        <span className="text-xs text-slate-500">
          Mes actual: {new Date().toLocaleDateString("es-NI", { month: "long", year: "numeric" })}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Presupuesto Total</p>
          <p className="text-xl font-bold text-blue-700">
            C$ {totalBudget.toLocaleString("es-NI")}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border">
          <p className="text-xs text-slate-600 mb-1">Gasto Real</p>
          <p className="text-xl font-bold text-slate-700">
            C$ {totalActual.toLocaleString("es-NI")}
          </p>
        </div>
        <div className={`rounded-lg p-4 border ${
          totalActual <= totalBudget 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <p className={`text-xs mb-1 ${totalActual <= totalBudget ? "text-green-600" : "text-red-600"}`}>
            {totalActual <= totalBudget ? "Disponible" : "Excedido"}
          </p>
          <p className={`text-xl font-bold ${
            totalActual <= totalBudget ? "text-green-700" : "text-red-700"
          }`}>
            C$ {Math.abs(totalBudget - totalActual).toLocaleString("es-NI")}
          </p>
        </div>
      </div>

      {/* Budget Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-right">Presupuesto</th>
              <th className="px-4 py-3 text-right">Gasto Real</th>
              <th className="px-4 py-3 text-right">Variación</th>
              <th className="px-4 py-3 text-center">Progreso</th>
              <th className="px-4 py-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {item.status === "over" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {editingCategory === item.id ? (
                    <input
                      type="number"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      className="w-24 border rounded px-2 py-1 text-right text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveBudget(item.id);
                        if (e.key === "Escape") setEditingCategory(null);
                      }}
                    />
                  ) : (
                    <span className="text-slate-600">
                      C$ {item.budget.toLocaleString("es-NI")}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  C$ {item.actual.toLocaleString("es-NI")}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  item.variance >= 0 ? "text-green-600" : "text-red-600"
                }`}>
                  {item.variance >= 0 ? "+" : ""} C$ {item.variance.toLocaleString("es-NI")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.status === "over" ? "bg-red-500" :
                          item.status === "warning" ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(item.percentUsed, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right">
                      {item.percentUsed.toFixed(0)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {editingCategory === item.id ? (
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => handleSaveBudget(item.id)}
                        className="px-2 py-1 bg-emerald-600 text-white rounded text-xs"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingCategory(null)}
                        className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-xs"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingCategory(item.id);
                        setBudgetInput(item.budget.toString());
                      }}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 italic">
        Nota: Los presupuestos se guardan localmente. Para persistencia permanente, 
        se requiere implementar una tabla de presupuestos en la base de datos.
      </p>
    </div>
  );
}