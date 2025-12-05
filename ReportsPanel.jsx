"use client";

import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

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

  const exportToPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const reportTitle = {
      balance_sheet: "Balance General",
      income_statement: "Estado de Resultados",
      cash_flow: "Flujo de Efectivo",
    }[reportType];

    doc.setFontSize(18);
    doc.text(reportTitle, pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Periodo: ${month}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Generado: ${new Date().toLocaleDateString("es-NI")}`, pageWidth / 2, 34, { align: "center" });

    let yPos = 45;

    if (reportType === "balance_sheet" && reportData.balanceSheet) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("ACTIVOS", 14, yPos);
      yPos += 5;

      const assetsData = (reportData.balanceSheet.assets || []).map((a) => [
        a.name,
        `C$ ${(a.balance || 0).toLocaleString("es-NI")}`,
      ]);
      assetsData.push(["Total Activos", `C$ ${(reportData.balanceSheet.totalAssets || 0).toLocaleString("es-NI")}`]);

      doc.autoTable({
        startY: yPos,
        head: [["Cuenta", "Saldo"]],
        body: assetsData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      doc.setFont(undefined, "bold");
      doc.text("PASIVOS", 14, yPos);
      yPos += 5;

      const liabilitiesData = (reportData.balanceSheet.liabilities || []).map((l) => [
        l.name,
        `C$ ${(l.balance || 0).toLocaleString("es-NI")}`,
      ]);
      liabilitiesData.push(["Total Pasivos", `C$ ${(reportData.balanceSheet.totalLiabilities || 0).toLocaleString("es-NI")}`]);

      doc.autoTable({
        startY: yPos,
        head: [["Cuenta", "Saldo"]],
        body: liabilitiesData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [239, 68, 68] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      doc.setFont(undefined, "bold");
      doc.text("CAPITAL", 14, yPos);
      yPos += 5;

      const equityData = (reportData.balanceSheet.equity || []).map((e) => [
        e.name,
        `C$ ${(e.balance || 0).toLocaleString("es-NI")}`,
      ]);
      equityData.push(["Total Capital", `C$ ${(reportData.balanceSheet.totalEquity || 0).toLocaleString("es-NI")}`]);

      doc.autoTable({
        startY: yPos,
        head: [["Cuenta", "Saldo"]],
        body: equityData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [147, 51, 234] },
        margin: { left: 14, right: 14 },
      });
    }

    if (reportType === "income_statement" && reportData.incomeStatement) {
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("INGRESOS", 14, yPos);
      yPos += 5;

      const incomeData = (reportData.incomeStatement.income || []).map((i) => [
        i.name,
        `C$ ${(i.amount || 0).toLocaleString("es-NI")}`,
      ]);
      incomeData.push(["Total Ingresos", `C$ ${(reportData.incomeStatement.totalIncome || 0).toLocaleString("es-NI")}`]);

      doc.autoTable({
        startY: yPos,
        head: [["Cuenta", "Monto"]],
        body: incomeData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 197, 94] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      doc.setFont(undefined, "bold");
      doc.text("GASTOS", 14, yPos);
      yPos += 5;

      const expensesData = (reportData.incomeStatement.expenses || []).map((e) => [
        e.name,
        `C$ ${(e.amount || 0).toLocaleString("es-NI")}`,
      ]);
      expensesData.push(["Total Gastos", `C$ ${(reportData.incomeStatement.totalExpenses || 0).toLocaleString("es-NI")}`]);

      doc.autoTable({
        startY: yPos,
        head: [["Cuenta", "Monto"]],
        body: expensesData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [249, 115, 22] },
        margin: { left: 14, right: 14 },
      });

      yPos = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      const netIncome = reportData.incomeStatement.netIncome || 0;
      if (netIncome >= 0) {
        doc.setTextColor(16, 185, 129);
      } else {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(`UTILIDAD NETA: C$ ${netIncome.toLocaleString("es-NI")}`, 14, yPos);
      doc.setTextColor(0, 0, 0);
    }

    if (reportType === "cash_flow" && reportData.cashFlow) {
      const cashFlowData = [
        ["Saldo Inicial", `C$ ${(reportData.cashFlow.openingBalance || 0).toLocaleString("es-NI")}`],
        ["Total Entradas", `C$ ${(reportData.cashFlow.totalInflows || 0).toLocaleString("es-NI")}`],
        ["Total Salidas", `C$ ${(reportData.cashFlow.totalOutflows || 0).toLocaleString("es-NI")}`],
        ["Flujo Neto", `C$ ${(reportData.cashFlow.netFlow || 0).toLocaleString("es-NI")}`],
        ["Saldo Final", `C$ ${(reportData.cashFlow.closingBalance || 0).toLocaleString("es-NI")}`],
      ];

      doc.autoTable({
        startY: yPos,
        head: [["Concepto", "Monto"]],
        body: cashFlowData,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [51, 65, 85] },
        margin: { left: 14, right: 14 },
      });

      if (reportData.cashFlow.inflows?.length > 0) {
        yPos = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text("Detalle de Entradas", 14, yPos);
        yPos += 5;

        const inflowsData = reportData.cashFlow.inflows.map((i) => [
          i.description,
          i.date,
          `C$ ${(i.amount || 0).toLocaleString("es-NI")}`,
        ]);

        doc.autoTable({
          startY: yPos,
          head: [["Descripcion", "Fecha", "Monto"]],
          body: inflowsData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [34, 197, 94] },
          margin: { left: 14, right: 14 },
        });
      }

      if (reportData.cashFlow.outflows?.length > 0) {
        yPos = doc.lastAutoTable.finalY + 10;
        doc.setFont(undefined, "bold");
        doc.text("Detalle de Salidas", 14, yPos);
        yPos += 5;

        const outflowsData = reportData.cashFlow.outflows.map((o) => [
          o.description,
          o.date,
          `C$ ${(o.amount || 0).toLocaleString("es-NI")}`,
        ]);

        doc.autoTable({
          startY: yPos,
          head: [["Descripcion", "Fecha", "Monto"]],
          body: outflowsData,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] },
          margin: { left: 14, right: 14 },
        });
      }
    }

    doc.save(`${reportType}_${month}.pdf`);
  };

  const exportToExcel = () => {
    if (!reportData) return;

    const reportTitle = {
      balance_sheet: "Balance General",
      income_statement: "Estado de Resultados",
      cash_flow: "Flujo de Efectivo",
    }[reportType];

    let sheetData = [
      [reportTitle],
      [`Periodo: ${month}`],
      [`Generado: ${new Date().toLocaleDateString("es-NI")}`],
      [],
    ];

    if (reportType === "balance_sheet" && reportData.balanceSheet) {
      sheetData.push(["ACTIVOS"]);
      sheetData.push(["Cuenta", "Saldo"]);
      (reportData.balanceSheet.assets || []).forEach((a) => {
        sheetData.push([a.name, a.balance || 0]);
      });
      sheetData.push(["Total Activos", reportData.balanceSheet.totalAssets || 0]);
      sheetData.push([]);

      sheetData.push(["PASIVOS"]);
      sheetData.push(["Cuenta", "Saldo"]);
      (reportData.balanceSheet.liabilities || []).forEach((l) => {
        sheetData.push([l.name, l.balance || 0]);
      });
      sheetData.push(["Total Pasivos", reportData.balanceSheet.totalLiabilities || 0]);
      sheetData.push([]);

      sheetData.push(["CAPITAL"]);
      sheetData.push(["Cuenta", "Saldo"]);
      (reportData.balanceSheet.equity || []).forEach((e) => {
        sheetData.push([e.name, e.balance || 0]);
      });
      sheetData.push(["Total Capital", reportData.balanceSheet.totalEquity || 0]);
    }

    if (reportType === "income_statement" && reportData.incomeStatement) {
      sheetData.push(["INGRESOS"]);
      sheetData.push(["Cuenta", "Monto"]);
      (reportData.incomeStatement.income || []).forEach((i) => {
        sheetData.push([i.name, i.amount || 0]);
      });
      sheetData.push(["Total Ingresos", reportData.incomeStatement.totalIncome || 0]);
      sheetData.push([]);

      sheetData.push(["GASTOS"]);
      sheetData.push(["Cuenta", "Monto"]);
      (reportData.incomeStatement.expenses || []).forEach((e) => {
        sheetData.push([e.name, e.amount || 0]);
      });
      sheetData.push(["Total Gastos", reportData.incomeStatement.totalExpenses || 0]);
      sheetData.push([]);

      sheetData.push(["UTILIDAD NETA", reportData.incomeStatement.netIncome || 0]);
    }

    if (reportType === "cash_flow" && reportData.cashFlow) {
      sheetData.push(["RESUMEN"]);
      sheetData.push(["Concepto", "Monto"]);
      sheetData.push(["Saldo Inicial", reportData.cashFlow.openingBalance || 0]);
      sheetData.push(["Total Entradas", reportData.cashFlow.totalInflows || 0]);
      sheetData.push(["Total Salidas", reportData.cashFlow.totalOutflows || 0]);
      sheetData.push(["Flujo Neto", reportData.cashFlow.netFlow || 0]);
      sheetData.push(["Saldo Final", reportData.cashFlow.closingBalance || 0]);
      sheetData.push([]);

      if (reportData.cashFlow.inflows?.length > 0) {
        sheetData.push(["DETALLE DE ENTRADAS"]);
        sheetData.push(["Descripcion", "Fecha", "Monto"]);
        reportData.cashFlow.inflows.forEach((i) => {
          sheetData.push([i.description, i.date, i.amount || 0]);
        });
        sheetData.push([]);
      }

      if (reportData.cashFlow.outflows?.length > 0) {
        sheetData.push(["DETALLE DE SALIDAS"]);
        sheetData.push(["Descripcion", "Fecha", "Monto"]);
        reportData.cashFlow.outflows.forEach((o) => {
          sheetData.push([o.description, o.date, o.amount || 0]);
        });
      }
    }

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportTitle);

    XLSX.writeFile(wb, `${reportType}_${month}.xlsx`);
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
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              CSV
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Excel
            </button>
            <button
              onClick={exportToPDF}
              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              PDF
            </button>
          </div>
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
