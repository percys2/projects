"use client";

import { useMemo } from "react";
import { AlertTriangle, Clock, AlertCircle } from "lucide-react";

export default function DueDateAlerts({ items, type = "receivables" }) {
  const alerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const overdue = [];
    const upcoming = [];

    items.forEach((item) => {
      if (item.status === "paid") return;
      if (!item.due_date) return;

      const dueDate = new Date(item.due_date);
      dueDate.setHours(0, 0, 0, 0);
      
      const balance = (item.total || 0) - (item.amount_paid || 0);
      if (balance <= 0) return;

      const itemData = {
        ...item,
        balance,
        dueDate,
        daysUntilDue: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24)),
      };

      if (dueDate < today) {
        overdue.push(itemData);
      } else if (dueDate <= sevenDaysFromNow) {
        upcoming.push(itemData);
      }
    });

    return {
      overdue: overdue.sort((a, b) => a.dueDate - b.dueDate),
      upcoming: upcoming.sort((a, b) => a.dueDate - b.dueDate),
    };
  }, [items]);

  const totalOverdue = alerts.overdue.reduce((sum, i) => sum + i.balance, 0);
  const totalUpcoming = alerts.upcoming.reduce((sum, i) => sum + i.balance, 0);

  if (alerts.overdue.length === 0 && alerts.upcoming.length === 0) {
    return null;
  }

  const label = type === "receivables" ? "por cobrar" : "por pagar";

  return (
    <div className="mb-4 space-y-3">
      {/* Overdue Alert */}
      {alerts.overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-semibold text-red-700">
              {alerts.overdue.length} {label} vencido(s) - C$ {totalOverdue.toLocaleString("es-NI")}
            </span>
          </div>
          <div className="space-y-1">
            {alerts.overdue.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-xs text-red-600 flex justify-between">
                <span>
                  {type === "receivables" ? item.client_name : item.supplier_name} - {item.factura || item.reference}
                </span>
                <span className="font-medium">
                  {Math.abs(item.daysUntilDue)} días vencido
                </span>
              </div>
            ))}
            {alerts.overdue.length > 3 && (
              <p className="text-xs text-red-500 italic">
                +{alerts.overdue.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Upcoming Alert */}
      {alerts.upcoming.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-semibold text-yellow-700">
              {alerts.upcoming.length} {label} próximo(s) a vencer - C$ {totalUpcoming.toLocaleString("es-NI")}
            </span>
          </div>
          <div className="space-y-1">
            {alerts.upcoming.slice(0, 3).map((item, idx) => (
              <div key={idx} className="text-xs text-yellow-700 flex justify-between">
                <span>
                  {type === "receivables" ? item.client_name : item.supplier_name} - {item.factura || item.reference}
                </span>
                <span className="font-medium">
                  {item.daysUntilDue === 0 ? "Hoy" : `En ${item.daysUntilDue} días`}
                </span>
              </div>
            ))}
            {alerts.upcoming.length > 3 && (
              <p className="text-xs text-yellow-600 italic">
                +{alerts.upcoming.length - 3} más...
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}