"use client";

import FinanceExportButtons from "../FinanceExportButtons";
import DueDateAlerts from "../DueDateAlerts";

export default function ReceivablesTab({ 
  finance, 
  onAbonar, 
  onViewHistory, 
  onPrint 
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-slate-700">Cuentas por Cobrar</h3>
        <FinanceExportButtons 
          data={finance.receivables} 
          type="receivables" 
          title="Cuentas por Cobrar" 
        />
      </div>

      <DueDateAlerts items={finance.receivables} type="receivables" />

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
              <th className="px-3 py-2 text-left">Cliente</th>
              <th className="px-3 py-2 text-left">Factura</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Vence</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Pagado</th>
              <th className="px-3 py-2 text-right">Saldo</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {finance.receivables.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                  No hay cuentas por cobrar pendientes
                </td>
              </tr>
            ) : (
              finance.receivables.map((r) => (
                <tr key={r.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{r.client_name || "Cliente"}</td>
                  <td className="px-3 py-2">{r.factura}</td>
                  <td className="px-3 py-2">{r.fecha}</td>
                  <td className="px-3 py-2">{r.due_date || "-"}</td>
                  <td className="px-3 py-2 text-right">C$ {r.total?.toLocaleString("es-NI")}</td>
                  <td className="px-3 py-2 text-right">C$ {(r.amount_paid || 0).toLocaleString("es-NI")}</td>
                  <td className="px-3 py-2 text-right font-medium text-red-600">
                    C$ {((r.total || 0) - (r.amount_paid || 0)).toLocaleString("es-NI")}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      r.status === "paid" ? "bg-green-100 text-green-700" :
                      r.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {r.status === "paid" ? "Pagado" : r.status === "partial" ? "Parcial" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1 justify-center flex-wrap">
                      {r.status !== "paid" && (
                        <button
                          onClick={() => onAbonar(r)}
                          className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        >
                          Abonar
                        </button>
                      )}
                      <button
                        onClick={() => onViewHistory(r, "receivables")}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Historial
                      </button>
                      <button
                        onClick={() => onPrint(r)}
                        className="text-emerald-600 hover:underline text-xs"
                      >
                        Imprimir
                      </button>
                      <button
                        onClick={() => finance.deleteReceivable(r.id)}
                        className="text-red-600 hover:underline text-xs"
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
    </div>
  );
}

