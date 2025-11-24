import React from "react";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";
import { formatDate } from "@/src/lib/utils/formatDate";

export default function TransactionsList({ transactions, onEdit, onDelete }) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay transacciones registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-xs text-slate-600">
            <th className="pb-2 font-medium">Fecha</th>
            <th className="pb-2 font-medium">Descripción</th>
            <th className="pb-2 font-medium">Categoría</th>
            <th className="pb-2 font-medium">Tipo</th>
            <th className="pb-2 font-medium text-right">Monto</th>
            <th className="pb-2 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b hover:bg-slate-50">
              <td className="py-3 text-sm">
                {formatDate(transaction.date)}
              </td>
              <td className="py-3 text-sm">{transaction.description}</td>
              <td className="py-3 text-sm">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                  {transaction.category}
                </span>
              </td>
              <td className="py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    transaction.type === "income"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.type === "income" ? "Ingreso" : "Gasto"}
                </span>
              </td>
              <td className="py-3 text-sm text-right font-medium">
                {formatCurrency(transaction.amount)}
              </td>
              <td className="py-3 text-sm text-right">
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-blue-600 hover:text-blue-800 mr-3 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(transaction.id)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
