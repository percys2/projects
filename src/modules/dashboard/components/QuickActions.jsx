"use client";

import React from "react";
import { ShoppingCart, UserPlus, Receipt, Wallet, Package, FileText } from "lucide-react";

const actions = [
  { key: "pos", icon: ShoppingCart, label: "Nueva Venta", color: "emerald" },
  { key: "crm", icon: UserPlus, label: "Nuevo Cliente", color: "blue" },
  { key: "finance", icon: Receipt, label: "Registrar Gasto", color: "slate" },
  { key: "finance", icon: Wallet, label: "Registrar Pago", color: "slate" },
  { key: "inventory", icon: Package, label: "Ver Inventario", color: "blue" },
  { key: "sales", icon: FileText, label: "Ver Ventas", color: "slate" },
];

const colorClasses = {
  emerald: "bg-emerald-50 hover:bg-emerald-100 text-emerald-600",
  blue: "bg-blue-50 hover:bg-blue-100 text-blue-600",
  slate: "bg-slate-50 hover:bg-slate-100 text-slate-600",
};

export default function QuickActions({ onNavigate }) {
  return (
    <div className="bg-white rounded-xl border p-3 sm:p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Acciones Rapidas</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(action.key)}
              className={`flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 rounded-lg transition min-h-[70px] ${colorClasses[action.color]}`}
            >
              <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-[10px] sm:text-xs font-medium text-center">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
