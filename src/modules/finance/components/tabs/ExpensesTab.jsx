"use client";

import ExpenseTrendChart from "../ExpenseTrendChart";
import FinanceExportButtons from "../FinanceExportButtons";
import ExpensesList from "../ExpensesList";

export default function ExpensesTab({ finance }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4 border">
        <h3 className="font-medium text-slate-700 mb-4">Tendencia de Gastos</h3>
        <ExpenseTrendChart expenses={finance.expenses} />
      </div>
      <div className="flex justify-end mb-4">
        <FinanceExportButtons 
          data={finance.expenses} 
          type="expenses" 
          title="Gastos" 
        />
      </div>
      <ExpensesList
        expenses={finance.expenses}
        onEdit={finance.openEditExpense}
        onDelete={finance.deleteExpense}
      />
    </div>
  );
}