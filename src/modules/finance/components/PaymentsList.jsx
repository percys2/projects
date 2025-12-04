"use client";

import React from "react";

export default function PaymentsList({ payments, onEdit, onDelete, compact }) {
  const safePayments = Array.isArray(payments) ? payments : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-left">Cliente/Proveedor</th>
            <th className="px-3 py-2 text-left">Método</th>
            <th className="px-3 py-2 text-right">Monto</th>
            <th className="px-3 py-2 text-left">Notas</th>
            {!compact && <th className="px-3 py-2 text-right">Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {safePayments.length === 0 ? (
            <tr>
              <td colSpan={compact ? 6 : 7} className="px-3 py-8 text-center text-slate-400">
                No hay pagos/cobros registrados
              </td>
            </tr>
          ) : (
            safePayments.map((payment) => (
              <tr key={payment.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">{payment.date}</td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      payment.direction === "in"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {payment.direction === "in" ? "Cobro" : "Pago"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {payment.client_name || payment.supplier_name || "-"}
                </td>
                <td className="px-3 py-2 capitalize">{payment.method || "-"}</td>
                <td className={`px-3 py-2 text-right font-medium ${
                  payment.direction === "in" ? "text-green-600" : "text-red-600"
                }`}>
                  {payment.direction === "in" ? "+" : "-"} C$ {payment.amount?.toLocaleString("es-NI")}
                </td>
                <td className="px-3 py-2 max-w-xs truncate">{payment.notes || "-"}</td>
                {!compact && (
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit && onEdit(payment)}
                        className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(payment.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
