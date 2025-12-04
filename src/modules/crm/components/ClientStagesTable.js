"use client";

import React from "react";
import { getStageColor } from "../services/crmConfig";

export default function ClientStagesTable({ clientsByStage, stages }) {
  if (!clientsByStage || clientsByStage.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay clientes con oportunidades activas
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Hoy";
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString("es-NI", { day: "2-digit", month: "short" });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2 text-left">Cliente</th>
            <th className="px-3 py-2 text-left">Teléfono</th>
            <th className="px-3 py-2 text-center">Etapa Actual</th>
            <th className="px-3 py-2 text-center">Oportunidades</th>
            <th className="px-3 py-2 text-right">Valor Total</th>
            <th className="px-3 py-2 text-center">Último Contacto</th>
          </tr>
        </thead>
        <tbody>
          {clientsByStage.map((client) => {
            const colors = getStageColor(client.stage_color);

            return (
              <tr key={client.client_id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-800">{client.client_name}</p>
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {client.client_phone || "—"}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}
                  >
                    {client.stage_name}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="px-2 py-1 bg-slate-100 rounded-full text-xs">
                    {client.opportunityCount}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-medium text-emerald-600">
                  C$ {(client.totalAmount || 0).toLocaleString("es-NI")}
                </td>
                <td className="px-3 py-2 text-center text-slate-500">
                  {formatDate(client.lastContact)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}