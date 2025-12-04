"use client";

import React, { useState } from "react";

export default function ReportsPanel({ orgSlug, accounts }) {
  const [reportType, setReportType] = useState("balance_sheet");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/reports/${reportType}?month=${month}`, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Report error:", err);
      alert("Error al generar reporte");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = "";
    const reportTitle = {
      balance_sheet: "Balance General",
      income_statement: "Estado de Resultados",
      cash_flow: "Flujo de Efectivo",
    }[reportType];

    csvContent += `${reportTitle}\n`;
    csvContent += `Periodo: ${month}\n\n`;

    if (reportType === "balance_sheet" && reportData.balanceSheet) {
      csvContent += "ACTIVOS\n";
      csvContent += "Cuenta,Saldo\n";
      (reportData.balanceSheet.assets || []).forEach((a) => {
        csvContent += `${a.name},${a.balance}\n`;
      });
      csvContent += `Total Activos,${reportData.balanceSheet.totalAssets}\n\n`;

      csvContent += "PASIVOS\n";
      (reportData.balanceSheet.liabilities || []).forEach((l) => {
        csvContent += `${l.name},${l.balance}\n`;
      });
      csvContent += `Total Pasivos,${reportData.balanceSheet.totalLiabilities}\n\n`;

      csvContent += "CAPITAL\n";
      (reportData.balanceSheet.equity || []).forEach((e) => {
        csvContent += `${e.name},${e.balance}\n`;
      });
      csvContent += `Total Capital,${reportData.balanceSheet.totalEquity}\n`;
    }

    if (reportType === "income_statement" && reportData.incomeStatement) {
      csvContent += "INGRESOS\n";
      csvContent += "Cuenta,Monto\n";
      (reportData.incomeStatement.income || []).forEach((i) => {
        csvContent += `${i.name},${i.amount}\n`;
      });
      csvContent += `Total Ingresos,${reportData.incomeStatement.totalIncome}\n\n`;

      csvContent += "GASTOS\n";
      (reportData.incomeStatement.expenses || []).forEach((e) => {
        csvContent += `${e.name},${e.amount}\n`;
      });
      csvContent += `Total Gastos,${reportData.incomeStatement.totalExpenses}\n\n`;

      csvContent += `Utilidad Neta,${reportData.incomeStatement.netIncome}\n`;
    }

    if (reportType === "cash_flow" && reportData.cashFlow) {
      csvContent += "Saldo Inicial," + reportData.cashFlow.openingBalance + "\n";
      csvContent += "Entradas," + reportData.cashFlow.totalInflows + "\n";
      csvContent += "Salidas," + reportData.cashFlow.totalOutflows + "\n";
      csvContent += "Flujo Neto," + reportData.cashFlow.netFlow + "\n";
      csvContent += "Saldo Final," + reportData.cashFlow.closingBalance + "\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${reportType}_${month}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Tipo de Reporte
          </label>
          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setReportData(null);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="balance_sheet">Balance General</option>
            <option value="income_statement">Estado de Resultados</option>
            <option value="cash_flow">Flujo de Efectivo</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Periodo
          </label>
          <input
            type="month"
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setReportData(null);
            }}
            className="border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar Reporte"}
        </button>

        {reportData && (
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          >
            Exportar CSV
          </button>
        )}
      </div>

      {reportData && reportType === "balance_sheet" && reportData.balanceSheet && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Balance General - {month}</h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3">ACTIVOS</h4>
                <div className="space-y-2">
                  {(reportData.balanceSheet.assets || []).map((a, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{a.name}</span>
                      <span className="font-medium">C$ {a.balance?.toLocaleString("es-NI")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-blue-300 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total Activos</span>
                  <span className="text-blue-700">
                    C$ {reportData.balanceSheet.totalAssets?.toLocaleString("es-NI")}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-3">PASIVOS</h4>
                <div className="space-y-2">
                  {(reportData.balanceSheet.liabilities || []).map((l, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{l.name}</span>
                      <span className="font-medium">C$ {l.balance?.toLocaleString("es-NI")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-red-300 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total Pasivos</span>
                  <span className="text-red-700">
                    C$ {reportData.balanceSheet.totalLiabilities?.toLocaleString("es-NI")}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-3">CAPITAL</h4>
                <div className="space-y-2">
                  {(reportData.balanceSheet.equity || []).map((e, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{e.name}</span>
                      <span className="font-medium">C$ {e.balance?.toLocaleString("es-NI")}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-purple-300 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total Capital</span>
                  <span className="text-purple-700">
                    C$ {reportData.balanceSheet.totalEquity?.toLocaleString("es-NI")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportData && reportType === "income_statement" && reportData.incomeStatement && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Estado de Resultados - {month}</h3>

          <div className="max-w-xl space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">INGRESOS</h4>
              <div className="space-y-2">
                {(reportData.incomeStatement.income || []).map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{i.name}</span>
                    <span className="font-medium">C$ {i.amount?.toLocaleString("es-NI")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-green-300 mt-3 pt-3 flex justify-between font-semibold">
                <span>Total Ingresos</span>
                <span className="text-green-700">
                  C$ {reportData.incomeStatement.totalIncome?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-3">GASTOS</h4>
              <div className="space-y-2">
                {(reportData.incomeStatement.expenses || []).map((e, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{e.name}</span>
                    <span className="font-medium">C$ {e.amount?.toLocaleString("es-NI")}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-orange-300 mt-3 pt-3 flex justify-between font-semibold">
                <span>Total Gastos</span>
                <span className="text-orange-700">
                  C$ {reportData.incomeStatement.totalExpenses?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className={`${reportData.incomeStatement.netIncome >= 0 ? "bg-emerald-100 border-emerald-300" : "bg-red-100 border-red-300"} border rounded-lg p-4`}>
              <div className="flex justify-between font-bold text-lg">
                <span>UTILIDAD NETA</span>
                <span className={reportData.incomeStatement.netIncome >= 0 ? "text-emerald-700" : "text-red-700"}>
                  C$ {reportData.incomeStatement.netIncome?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {reportData && reportType === "cash_flow" && reportData.cashFlow && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-slate-800">Flujo de Efectivo - {month}</h3>

          <div className="max-w-xl space-y-4">
            <div className="bg-slate-50 border rounded-lg p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Saldo Inicial</span>
                <span className="font-medium">
                  C$ {reportData.cashFlow.openingBalance?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-3">ENTRADAS</h4>
              <div className="space-y-2">
                {(reportData.cashFlow.inflows || []).map((i, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{i.description}</span>
                    <span className="font-medium text-green-600">
                      + C$ {i.amount?.toLocaleString("es-NI")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-green-300 mt-3 pt-3 flex justify-between font-semibold">
                <span>Total Entradas</span>
                <span className="text-green-700">
                  C$ {reportData.cashFlow.totalInflows?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-3">SALIDAS</h4>
              <div className="space-y-2">
                {(reportData.cashFlow.outflows || []).map((o, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-slate-600">{o.description}</span>
                    <span className="font-medium text-red-600">
                      - C$ {o.amount?.toLocaleString("es-NI")}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-red-300 mt-3 pt-3 flex justify-between font-semibold">
                <span>Total Salidas</span>
                <span className="text-red-700">
                  C$ {reportData.cashFlow.totalOutflows?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className={`${reportData.cashFlow.netFlow >= 0 ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"} border rounded-lg p-4`}>
              <div className="flex justify-between mb-2">
                <span className="text-slate-600">Flujo Neto del Periodo</span>
                <span className={`font-semibold ${reportData.cashFlow.netFlow >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  C$ {reportData.cashFlow.netFlow?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>

            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <div className="flex justify-between font-bold text-lg">
                <span>SALDO FINAL</span>
                <span className="text-blue-700">
                  C$ {reportData.cashFlow.closingBalance?.toLocaleString("es-NI")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!reportData && !loading && (
        <div className="text-center py-12 text-slate-400">
          Selecciona un tipo de reporte y periodo, luego haz clic en "Generar Reporte"
        </div>
      )}
    </div>
  );
}
