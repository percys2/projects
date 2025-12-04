"use client";

import React from "react";

export default function ExpensesList({ expenses, onEdit, onDelete }) {
  const safeExpenses = Array.isArray(expenses) ? expenses : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Proveedor</th>
            <th className="px-3 py-2 text-left">Referencia</th>
            <th className="px-3 py-2 text-left">Descripción</th>
            <th className="px-3 py-2 text-right">Total</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-left">Vence</th>
            <th className="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {safeExpenses.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
                No hay gastos registrados
              </td>
            </tr>
          ) : (
            safeExpenses.map((expense) => (
              <tr key={expense.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{expense.date}</td>
                <td className="px-3 py-2">{expense.supplier_name || "Sin proveedor"}</td>
                <td className="px-3 py-2">{expense.reference || "-"}</td>
                <td className="px-3 py-2 max-w-xs truncate">{expense.notes || "-"}</td>
                <td className="px-3 py-2 text-right font-medium">
                  C$ {expense.total?.toLocaleString("es-NI")}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      expense.status === "paid"
                        ? "bg-green-100 text-green-700"
                        : expense.status === "partial"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {expense.status === "paid"
                      ? "Pagado"
                      : expense.status === "partial"
                      ? "Parcial"
                      : "Pendiente"}
                  </span>
                </td>
                <td className="px-3 py-2">{expense.due_date || "-"}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit && onEdit(expense)}
                      className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(expense.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
