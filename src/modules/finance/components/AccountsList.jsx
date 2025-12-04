"use client";

import React from "react";

const ACCOUNT_TYPES = {
  asset: { label: "Activo", color: "bg-blue-100 text-blue-700" },
  liability: { label: "Pasivo", color: "bg-red-100 text-red-700" },
  equity: { label: "Capital", color: "bg-purple-100 text-purple-700" },
  income: { label: "Ingreso", color: "bg-green-100 text-green-700" },
  expense: { label: "Gasto", color: "bg-orange-100 text-orange-700" },
};

export default function AccountsList({ accounts, onEdit, onDelete }) {
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  const groupedAccounts = safeAccounts.reduce((acc, account) => {
    const type = account.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(account);
    return acc;
  }, {});

  const typeOrder = ["asset", "liability", "equity", "income", "expense"];

  return (
    <div className="space-y-6">
      {typeOrder.map((type) => {
        const typeAccounts = groupedAccounts[type] || [];
        if (typeAccounts.length === 0) return null;

        const typeInfo = ACCOUNT_TYPES[type] || { label: type, color: "bg-gray-100 text-gray-700" };

        return (
          <div key={type} className="space-y-2">
            <h3 className="font-medium text-slate-700 flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
              <span className="text-xs text-slate-400">({typeAccounts.length} cuentas)</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                    <th className="px-3 py-2 text-left">Código</th>
                    <th className="px-3 py-2 text-left">Nombre</th>
                    <th className="px-3 py-2 text-left">Subtipo</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                    <th className="px-3 py-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {typeAccounts
                    .sort((a, b) => (a.code || "").localeCompare(b.code || ""))
                    .map((account) => (
                      <tr key={account.id} className="border-b hover:bg-slate-50">
                        <td className="px-3 py-2 font-mono text-xs">{account.code}</td>
                        <td className="px-3 py-2">{account.name}</td>
                        <td className="px-3 py-2 text-slate-500 text-xs">{account.subtype || "-"}</td>
                        <td className="px-3 py-2 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              account.is_active !== false
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {account.is_active !== false ? "Activa" : "Inactiva"}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => onEdit && onEdit(account)}
                              className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => onDelete && onDelete(account.id)}
                              className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {safeAccounts.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No hay cuentas contables registradas
        </div>
      )}
    </div>
  );
}
