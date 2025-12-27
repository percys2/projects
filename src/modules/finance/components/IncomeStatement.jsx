"use client";

import React, { useState } from "react";
import { useIncomeStatement } from "../hooks/useIncomeStatement";
import { formatCurrency, formatPercent } from "@/src/lib/formatters/currency";
import KpiCard from "@/src/components/ui/KpiCard";
import SectionCard from "@/src/components/ui/SectionCard";
import ReportTable from "@/src/components/ui/ReportTable";

export default function IncomeStatement({ payments, expenses, sales = [], orgName = "Mi Empresa" }) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);

  const { currentData, previousData, periodLabel, calculateVariance } = useIncomeStatement({
    payments,
    expenses,
    sales,
    period: selectedPeriod,
    month: selectedMonth,
    year: selectedYear,
    compareWithPrevious,
  });

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Estado de Resultados - ${periodLabel}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
            td.right { text-align: right; }
            .section-header { background: #e8e8e8; font-weight: bold; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .grand-total { background: #333; color: white; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>ESTADO DE RESULTADOS</h2>
            <p>Periodo: ${periodLabel}</p>
          </div>
          <table>
            <tr class="section-header"><td colspan="3">INGRESOS</td></tr>
            ${currentData.income.map((i) => `<tr><td>${i.name}</td><td class="right">${formatCurrency(i.amount)}</td><td class="right">${formatPercent((i.amount / currentData.totalIncome) * 100)}</td></tr>`).join("")}
            <tr class="total-row"><td>Total Ingresos</td><td class="right">${formatCurrency(currentData.totalIncome)}</td><td class="right">100%</td></tr>
            <tr class="section-header"><td colspan="3">COSTO DE VENTAS</td></tr>
            <tr><td>Costo de productos vendidos</td><td class="right">${formatCurrency(currentData.cogs)}</td><td class="right">${formatPercent((currentData.cogs / currentData.totalIncome) * 100)}</td></tr>
            <tr class="total-row"><td>UTILIDAD BRUTA</td><td class="right">${formatCurrency(currentData.grossProfit)}</td><td class="right">${formatPercent((currentData.grossProfit / currentData.totalIncome) * 100)}</td></tr>
            <tr class="section-header"><td colspan="3">GASTOS OPERATIVOS</td></tr>
            ${currentData.expenses.map((e) => `<tr><td>${e.name}</td><td class="right">${formatCurrency(e.amount)}</td><td class="right">${formatPercent((e.amount / currentData.totalIncome) * 100)}</td></tr>`).join("")}
            <tr class="total-row"><td>Total Gastos</td><td class="right">${formatCurrency(currentData.totalExpenses)}</td><td class="right">${formatPercent((currentData.totalExpenses / currentData.totalIncome) * 100)}</td></tr>
            <tr class="grand-total"><td>UTILIDAD NETA</td><td class="right">${formatCurrency(currentData.netIncome)}</td><td class="right">${formatPercent((currentData.netIncome / currentData.totalIncome) * 100)}</td></tr>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const rows = [
      ["Estado de Resultados - " + orgName],
      ["Periodo: " + periodLabel],
      [""],
      ["Concepto", "Monto", "% del Total"],
      ["INGRESOS", "", ""],
      ...currentData.income.map((i) => [i.name, i.amount.toFixed(2), formatPercent((i.amount / currentData.totalIncome) * 100)]),
      ["Total Ingresos", currentData.totalIncome.toFixed(2), "100%"],
      [""],
      ["COSTO DE VENTAS", currentData.cogs.toFixed(2), formatPercent((currentData.cogs / currentData.totalIncome) * 100)],
      ["UTILIDAD BRUTA", currentData.grossProfit.toFixed(2), formatPercent((currentData.grossProfit / currentData.totalIncome) * 100)],
      [""],
      ["GASTOS OPERATIVOS", "", ""],
      ...currentData.expenses.map((e) => [e.name, e.amount.toFixed(2), formatPercent((e.amount / currentData.totalIncome) * 100)]),
      ["Total Gastos", currentData.totalExpenses.toFixed(2), formatPercent((currentData.totalExpenses / currentData.totalIncome) * 100)],
      [""],
      ["UTILIDAD NETA", currentData.netIncome.toFixed(2), formatPercent((currentData.netIncome / currentData.totalIncome) * 100)],
    ];

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `estado_resultados_${selectedMonth || selectedYear}.csv`;
    link.click();
  };

  const incomeColumns = [
    { header: "Categoria", key: "name" },
    { header: "Monto", key: "amount", align: "right", render: (row) => formatCurrency(row.amount) },
    { header: "% de Ingresos", align: "right", render: (row) => formatPercent((row.amount / currentData.totalIncome) * 100) },
  ];

  const expenseColumns = [
    { header: "Categoria", key: "name" },
    { header: "Monto", key: "amount", align: "right", render: (row) => formatCurrency(row.amount) },
    { header: "% de Ingresos", align: "right", render: (row) => formatPercent((row.amount / currentData.totalIncome) * 100) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Estado de Resultados (P&L)</h3>
          <p className="text-xs text-slate-500">Ingresos, gastos y utilidad del periodo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral</option>
            <option value="year">Anual</option>
          </select>
          {selectedPeriod === "month" && (
            <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          )}
          {selectedPeriod !== "month" && (
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          )}
          <button onClick={handleExportCSV} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700">Exportar CSV</button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">Imprimir</button>
        </div>
      </div>

      {/* Compare Toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={compareWithPrevious} onChange={(e) => setCompareWithPrevious(e.target.checked)} className="rounded" />
        Comparar con periodo anterior
      </label>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Ingresos Totales" value={formatCurrency(currentData.totalIncome)} variant="success" trend={previousData ? calculateVariance(currentData.totalIncome, previousData.totalIncome) : undefined} trendLabel="vs anterior" />
        <KpiCard title="Costo de Ventas" value={formatCurrency(currentData.cogs)} variant="warning" />
        <KpiCard title="Gastos Operativos" value={formatCurrency(currentData.totalExpenses)} variant="danger" trend={previousData ? calculateVariance(currentData.totalExpenses, previousData.totalExpenses) : undefined} trendLabel="vs anterior" />
        <KpiCard title="Utilidad Neta" value={formatCurrency(currentData.netIncome)} variant={currentData.netIncome >= 0 ? "primary" : "danger"} subtitle={`Margen: ${formatPercent((currentData.netIncome / currentData.totalIncome) * 100)}`} />
      </div>

      {/* Income Section */}
      <SectionCard title="INGRESOS" variant="success">
        <ReportTable columns={incomeColumns} data={currentData.income} emptyMessage="No hay ingresos en este periodo" footer={[{ value: "Total Ingresos", colSpan: 1 }, { value: formatCurrency(currentData.totalIncome), align: "right" }, { value: "100%", align: "right" }]} />
      </SectionCard>

      {/* COGS Section */}
      <SectionCard title="COSTO DE VENTAS" variant="warning">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Costo de productos vendidos</span>
            <span className="text-sm font-medium text-amber-700">{formatCurrency(currentData.cogs)}</span>
          </div>
          {currentData.cogs === 0 && currentData.usingSalesData && (
            <p className="text-xs text-slate-400 mt-2">No hay datos de costo en los items de venta.</p>
          )}
        </div>
        <div className="px-4 py-3 bg-amber-100 border-t flex justify-between font-semibold">
          <span>Total Costo de Ventas</span>
          <span className="text-amber-700">{formatCurrency(currentData.cogs)}</span>
        </div>
      </SectionCard>

      {/* Gross Profit */}
      <div className="border rounded-lg p-4 bg-slate-50">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-sm font-semibold text-slate-700">UTILIDAD BRUTA</h4>
            <p className="text-xs text-slate-500">Ingresos - Costo de Ventas</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-slate-700">{formatCurrency(currentData.grossProfit)}</p>
            <p className="text-xs text-slate-500">Margen Bruto: {formatPercent((currentData.grossProfit / currentData.totalIncome) * 100)}</p>
          </div>
        </div>
      </div>

      {/* Expenses Section */}
      <SectionCard title="GASTOS OPERATIVOS" variant="danger">
        <ReportTable columns={expenseColumns} data={currentData.expenses} emptyMessage="No hay gastos en este periodo" footer={[{ value: "Total Gastos", colSpan: 1 }, { value: formatCurrency(currentData.totalExpenses), align: "right" }, { value: formatPercent((currentData.totalExpenses / currentData.totalIncome) * 100), align: "right" }]} />
      </SectionCard>

      {/* Net Income */}
      <div className={`border rounded-lg p-4 ${currentData.netIncome >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-slate-700">UTILIDAD NETA</h4>
            <p className="text-xs text-slate-500">Ingresos - Costos - Gastos = Resultado del periodo</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${currentData.netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}>{formatCurrency(currentData.netIncome)}</p>
            <p className="text-sm text-slate-500">Margen: {formatPercent((currentData.netIncome / currentData.totalIncome) * 100)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}