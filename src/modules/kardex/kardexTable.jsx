"use client";

import React from "react";

export default function KardexTable({ movements }) {
  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <table className="min-w-full text-[12px]">
        <thead>
          <tr className="bg-slate-100 text-slate-600 uppercase text-[11px] border-b">
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Tipo</th>
            <th className="px-3 py-2 text-right">Cantidad</th>
            <th className="px-3 py-2 text-right">Costo</th>
            <th className="px-3 py-2 text-left">Desde</th>
            <th className="px-3 py-2 text-left">Hacia</th>
            <th className="px-3 py-2 text-left">Lote</th>
            <th className="px-3 py-2 text-left">Vence</th>
          </tr>
        </thead>

        <tbody>
          {movements.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="text-center py-6 text-slate-400 text-sm"
              >
                No hay movimientos registrados.
              </td>
            </tr>
          ) : (
            movements.map((m) => (
              <tr
                key={m.id}
                className="border-b hover:bg-slate-50 transition"
              >
                <td className="px-3 py-2">
                  {new Date(m.created_at).toLocaleDateString("es-NI")}
                </td>

                <td className="px-3 py-2 font-semibold capitalize">
                  {m.type}
                </td>

                <td className="px-3 py-2 text-right">{m.qty}</td>

                <td className="px-3 py-2 text-right">
                  {m.cost ? `C$ ${m.cost}` : "—"}
                </td>

                <td className="px-3 py-2">
                  {m.from_branch || m.branches?.name || "—"}
                </td>

                <td className="px-3 py-2">{m.to_branch || "—"}</td>

                <td className="px-3 py-2">{m.lot_number || "—"}</td>

                <td className="px-3 py-2">{m.expires_at || "—"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
