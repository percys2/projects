"use client";

import React, { useState } from "react";
import { useBalanceSheet } from "../hooks/useBalanceSheet";
import { formatCurrency } from "@/src/lib/formatters/currency";
import KpiCard from "@/src/components/ui/KpiCard";
import SectionCard from "@/src/components/ui/SectionCard";

export default function BalanceSheet({ sales, expenses, accounts, inventory, assets, payables, receivables, orgName = "Mi Empresa" }) {
  const [showDetails, setShowDetails] = useState(false);
  const { balanceData } = useBalanceSheet({ sales, expenses, accounts, inventory, assets, payables, receivables });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Balance General - ${orgName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            td.right { text-align: right; }
            .section-header { background: #e8e8e8; font-weight: bold; }
            .total-row { background: #333; color: white; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>BALANCE GENERAL</h2>
            <p>Fecha: ${new Date().toLocaleDateString("es-NI")}</p>
          </div>
          <table>
            <tr class="section-header"><td colspan="2">ACTIVOS</td></tr>
            <tr><td>Efectivo y Equivalentes</td><td class="right">${formatCurrency(balanceData.currentAssets.cash.amount)}</td></tr>
            <tr><td>Cuentas por Cobrar</td><td class="right">${formatCurrency(balanceData.currentAssets.receivables.amount)}</td></tr>
            <tr><td>Inventarios</td><td class="right">${formatCurrency(balanceData.currentAssets.inventory.amount)}</td></tr>
            <tr><td>Activos Fijos Neto</td><td class="right">${formatCurrency(balanceData.fixedAssets.netValue)}</td></tr>
            <tr class="total-row"><td>TOTAL ACTIVOS</td><td class="right">${formatCurrency(balanceData.totalAssets)}</td></tr>
            <tr class="section-header"><td colspan="2">PASIVOS</td></tr>
            ${balanceData.currentLiabilities.payables.amount > 0 ? `<tr><td>Cuentas por Pagar</td><td class="right">${formatCurrency(balanceData.currentLiabilities.payables.amount)}</td></tr>` : ""}
            <tr class="total-row"><td>TOTAL PASIVOS</td><td class="right">${formatCurrency(balanceData.totalLiabilities)}</td></tr>
            <tr class="section-header"><td colspan="2">PATRIMONIO</td></tr>
            <tr><td>Capital Social</td><td class="right">${formatCurrency(balanceData.equity.capital)}</td></tr>
            <tr><td>Utilidades Retenidas</td><td class="right">${formatCurrency(balanceData.equity.retainedEarnings)}</td></tr>
            <tr class="total-row"><td>TOTAL PATRIMONIO</td><td class="right">${formatCurrency(balanceData.equity.total)}</td></tr>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["Balance General - " + orgName],
      ["Fecha: " + new Date().toLocaleDateString("es-NI")],
      [""],
      ["ACTIVOS", ""],
      ["Efectivo y Equivalentes", balanceData.currentAssets.cash.amount.toFixed(2)],
      ["Cuentas por Cobrar", balanceData.currentAssets.receivables.amount.toFixed(2)],
      ["Inventarios", balanceData.currentAssets.inventory.amount.toFixed(2)],
      ["Activos Fijos Neto", balanceData.fixedAssets.netValue.toFixed(2)],
      ["TOTAL ACTIVOS", balanceData.totalAssets.toFixed(2)],
      [""],
      ["PASIVOS", ""],
      ["Cuentas por Pagar", balanceData.currentLiabilities.payables.amount.toFixed(2)],
      ["TOTAL PASIVOS", balanceData.totalLiabilities.toFixed(2)],
      [""],
      ["PATRIMONIO", ""],
      ["Capital Social", balanceData.equity.capital.toFixed(2)],
      ["Utilidades Retenidas", balanceData.equity.retainedEarnings.toFixed(2)],
      ["TOTAL PATRIMONIO", balanceData.equity.total.toFixed(2)],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `balance_general_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Balance General</h3>
          <p className="text-xs text-slate-500">Situacion financiera de la empresa</p>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showDetails} onChange={(e) => setShowDetails(e.target.checked)} className="rounded" />
            Ver detalles
          </label>
          <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Exportar CSV</button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">Imprimir</button>
        </div>
      </div>

      {/* Sales Summary */}
      {balanceData.salesSummary.revenue > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-3">Resumen de Operaciones</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard title="Ingresos" value={formatCurrency(balanceData.salesSummary.revenue)} variant="primary" />
            <KpiCard title="Costo de Ventas" value={formatCurrency(balanceData.salesSummary.cogs)} variant="muted" />
            <KpiCard title="Gastos Operativos" value={`(${formatCurrency(balanceData.salesSummary.expenses)})`} variant="muted" />
            <KpiCard title="Utilidad Neta" value={formatCurrency(balanceData.salesSummary.netIncome)} variant={balanceData.salesSummary.netIncome >= 0 ? "primary" : "danger"} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <SectionCard title="ACTIVOS" variant="primary">
          <div className="border-b">
            <div className="px-4 py-2 bg-blue-50 font-medium text-blue-700">Activos Corrientes</div>
            <table className="min-w-full text-sm">
              <tbody>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">{balanceData.currentAssets.cash.label}{balanceData.currentAssets.cash.isEstimated && <span className="ml-2 text-xs text-amber-600">(estimado)</span>}</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.currentAssets.cash.amount)}</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">Cuentas por Cobrar</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.currentAssets.receivables.amount)}</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">Inventarios</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.currentAssets.inventory.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-blue-100 font-semibold">
                  <td className="px-4 py-2">Total Activos Corrientes</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(balanceData.currentAssets.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="border-b">
            <div className="px-4 py-2 bg-blue-50 font-medium text-blue-700">Activos Fijos</div>
            <table className="min-w-full text-sm">
              <tbody>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">Activos Fijos (Costo)</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.fixedAssets.grossValue)}</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8 text-red-600">(-) Depreciacion Acumulada</td>
                  <td className="px-4 py-2 text-right font-medium text-red-600">({formatCurrency(balanceData.fixedAssets.depreciation)})</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-blue-100 font-semibold">
                  <td className="px-4 py-2">Total Activos Fijos Neto</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(balanceData.fixedAssets.netValue)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-4 py-3 bg-blue-600 text-white font-bold flex justify-between">
            <span>TOTAL ACTIVOS</span>
            <span>{formatCurrency(balanceData.totalAssets)}</span>
          </div>
        </SectionCard>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="space-y-4">
          <SectionCard title="PASIVOS" variant="danger">
            <div className="border-b">
              <div className="px-4 py-2 bg-red-50 font-medium text-red-700">Pasivos Corrientes</div>
              <table className="min-w-full text-sm">
                <tbody>
                  {balanceData.currentLiabilities.payables.amount > 0 && (
                    <tr className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2 pl-8">Cuentas por Pagar</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.currentLiabilities.payables.amount)}</td>
                    </tr>
                  )}
                  {balanceData.currentLiabilities.other.amount > 0 && (
                    <tr className="border-b hover:bg-slate-50">
                      <td className="px-4 py-2 pl-8">Otros Pasivos Corrientes</td>
                      <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.currentLiabilities.other.amount)}</td>
                    </tr>
                  )}
                  {balanceData.currentLiabilities.total === 0 && (
                    <tr className="border-b">
                      <td className="px-4 py-2 pl-8 text-slate-400 italic" colSpan={2}>Sin pasivos corrientes</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-red-100 font-semibold">
                    <td className="px-4 py-2">Total Pasivos</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.totalLiabilities)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </SectionCard>

          <SectionCard title="PATRIMONIO" variant="default">
            <table className="min-w-full text-sm">
              <tbody>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">Capital Social</td>
                  <td className="px-4 py-2 text-right font-medium">{formatCurrency(balanceData.equity.capital)}</td>
                </tr>
                <tr className="border-b hover:bg-slate-50">
                  <td className="px-4 py-2 pl-8">Utilidades Retenidas</td>
                  <td className={`px-4 py-2 text-right font-medium ${balanceData.equity.retainedEarnings >= 0 ? "text-emerald-600" : "text-red-600"}`}>{formatCurrency(balanceData.equity.retainedEarnings)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-purple-100 font-semibold">
                  <td className="px-4 py-2">Total Patrimonio</td>
                  <td className="px-4 py-2 text-right">{formatCurrency(balanceData.equity.total)}</td>
                </tr>
              </tfoot>
            </table>
            <div className="px-4 py-3 bg-slate-800 text-white font-bold flex justify-between">
              <span>TOTAL PASIVOS + PATRIMONIO</span>
              <span>{formatCurrency(balanceData.totalLiabilitiesAndEquity)}</span>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="border rounded-lg p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Indicadores Financieros</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard title="Razon Corriente" value={balanceData.currentLiabilities.total > 0 ? (balanceData.currentAssets.total / balanceData.currentLiabilities.total).toFixed(2) : "N/A"} subtitle="Activo Corriente / Pasivo Corriente" variant="primary" />
          <KpiCard title="Prueba Acida" value={balanceData.currentLiabilities.total > 0 ? ((balanceData.currentAssets.total - balanceData.currentAssets.inventory.amount) / balanceData.currentLiabilities.total).toFixed(2) : "N/A"} subtitle="(AC - Inventario) / PC" variant="secondary" />
          <KpiCard title="Endeudamiento" value={balanceData.totalAssets > 0 ? `${((balanceData.totalLiabilities / balanceData.totalAssets) * 100).toFixed(1)}%` : "0%"} subtitle="Pasivos / Activos" variant="muted" />
          <KpiCard title="Capital de Trabajo" value={formatCurrency(balanceData.currentAssets.total - balanceData.currentLiabilities.total)} subtitle="AC - PC" variant={(balanceData.currentAssets.total - balanceData.currentLiabilities.total) >= 0 ? "primary" : "danger"} />
        </div>
      </div>
    </div>
  );
}
