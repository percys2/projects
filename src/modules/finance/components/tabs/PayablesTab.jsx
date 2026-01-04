"use client";

import FinanceExportButtons from "../FinanceExportButtons";
import DueDateAlerts from "../DueDateAlerts";

export default function PayablesTab({ finance, onViewHistory }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-slate-700">Cuentas por Pagar</h3>
        <FinanceExportButtons 
          data={finance.payables} 
          type="payables" 
          title="Cuentas por Pagar" 
        />
      </div>
      
      <DueDateAlerts items={finance.payables} type="payables" />
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
              <th className="px-3 py-2 text-left">Proveedor</th>
              <th className="px-3 py-2 text-left">Referencia</th>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Vence</th>
              <th className="px-3 py-2 text-right">Total</th>
              <th className="px-3 py-2 text-right">Pagado</th>
              <th className="px-3 py-2 text-right">Saldo</th>
              <th className="px-3 py-2 text-left">Estado</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {finance.payables.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                  No hay cuentas por pagar pendientes
                </td>
              </tr>
            ) : (
              finance.payables.map((p) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">{p.supplier_name || "Proveedor"}</td>
                  <td className="px-3 py-2">{p.reference}</td>
                  <td className="px-3 py-2">{p.date}</td>
                  <td className="px-3 py-2">{p.due_date || "-"}</td>
                  <td className="px-3 py-2 text-right">C$ {p.total?.toLocaleString("es-NI")}</td>
                  <td className="px-3 py-2 text-right">C$ {(p.amount_paid || 0).toLocaleString("es-NI")}</td>
                  <td className="px-3 py-2 text-right font-medium text-red-600">
                    C$ {((p.total || 0) - (p.amount_paid || 0)).toLocaleString("es-NI")}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      p.status === "paid" ? "bg-green-100 text-green-700" :
                      p.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {p.status === "paid" ? "Pagado" : p.status === "partial" ? "Parcial" : "Pendiente"}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => finance.openPayBill(p)}
                        className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        disabled={p.status === "paid"}
                      >
                        Pagar
                      </button>
                      <button
                        onClick={() => onViewHistory(p, "payables")}
                        className="text-blue-600 hover:underline text-xs"
                      >
                        Historial
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