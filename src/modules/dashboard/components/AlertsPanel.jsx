"use client";

import React from "react";
import { AlertTriangle, Clock, Package } from "lucide-react";
import { formatCurrency } from "@/src/lib/formatters/currency";

export default function AlertsPanel({ overdueStats, lowStock, onNavigate }) {
  const hasAlerts = overdueStats.overdueReceivables > 0 || 
                    overdueStats.overduePayables > 0 || 
                    lowStock?.length > 0;

  if (!hasAlerts) return null;

  return (
    <div className="space-y-2">
      {overdueStats.overdueReceivables > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">
              Cuentas por cobrar vencidas: {formatCurrency(overdueStats.overdueReceivables)}
            </p>
          </div>
          <button onClick={() => onNavigate("finance")} className="text-xs text-red-600 hover:underline whitespace-nowrap">
            Ver detalles
          </button>
        </div>
      )}
      {overdueStats.overduePayables > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-700">
              Cuentas por pagar vencidas: {formatCurrency(overdueStats.overduePayables)}
            </p>
          </div>
          <button onClick={() => onNavigate("finance")} className="text-xs text-orange-600 hover:underline whitespace-nowrap">
            Ver detalles
          </button>
        </div>
      )}
      {lowStock?.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <Package className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-700">
              {lowStock.length} productos con stock bajo
            </p>
          </div>
          <button onClick={() => onNavigate("inventory")} className="text-xs text-yellow-600 hover:underline whitespace-nowrap">
            Ver inventario
          </button>
        </div>
      )}
    </div>
  );
}