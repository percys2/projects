"use client";

import React, { useState, useRef } from "react";

export default function DgiReports({ orgSlug }) {
  const [reportType, setReportType] = useState("ir");
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const printRef = useRef(null);

  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/hr/reports?type=${reportType}&month=${month}&year=${year}`, {
        headers: { "x-org-slug": orgSlug },
      });

      if (!res.ok) throw new Error("Error al generar reporte");

      const data = await res.json();
      setReport(data.report);
    } catch (err) {
      console.error("Report error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Informe DGI - ${getReportTitle()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 16px; }
            .header p { margin: 5px 0; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { font-weight: bold; background: #f0f0f0; }
            .footer { margin-top: 20px; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCSV = () => {
    if (!report?.data) return;

    let headers = [];
    let rows = [];

    switch (reportType) {
      case "ir":
        headers = ["Cedula", "No. INSS", "Nombre", "Cargo", "Salario", "Comisiones", "Total Bruto", "IR Mensual", "IR Anual", "Tasa"];
        rows = report.data.map(d => [
          d.cedula, d.inss_number, d.name, d.position,
          d.salary, d.commissions || 0, d.total_gross || d.salary, d.monthly_ir, d.annual_ir, d.ir_bracket
        ]);
        break;
      case "inss":
        headers = ["Cedula", "No. INSS", "Nombre", "Cargo", "Salario", "Comisiones", "Total Bruto", "INSS Laboral", "INSS Patronal", "Total INSS"];
        rows = report.data.map(d => [
          d.cedula, d.inss_number, d.name, d.position,
          d.salary, d.commissions || 0, d.total_gross || d.salary, d.employee_inss, d.employer_inss, d.total_inss
        ]);
        break;
      case "salarios":
        headers = ["Cedula", "No. INSS", "Nombre", "Cargo", "Salario", "Comisiones", "Salario Bruto", "INSS", "IR", "Salario Neto", "Banco", "Cuenta"];
        rows = report.data.map(d => [
          d.cedula, d.inss_number, d.name, d.position,
          d.salary, d.commissions || 0, d.gross_salary, d.inss_deduction, d.ir_deduction, d.net_salary,
          d.bank_name, d.bank_account
        ]);
        break;
    }

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `informe_${reportType}_${year}_${month}.csv`;
    link.click();
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "ir": return "Retenciones de IR";
      case "inss": return "Planilla INSS";
      case "salarios": return "Reporte de Salarios";
      default: return "Informe";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Generar Informe DGI</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Informe</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="ir">Retenciones de IR</option>
              <option value="inss">Planilla INSS</option>
              <option value="salarios">Reporte de Salarios</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mes</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ano</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {loading ? "Generando..." : "Generar Informe"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {report && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-slate-800">{getReportTitle()}</h4>
              <p className="text-xs text-slate-500">
                {months[report.period.month - 1]} {report.period.year} - {report.employee_count} empleados
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 text-xs border rounded-lg hover:bg-slate-50"
              >
                Exportar CSV
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-xs bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Imprimir
              </button>
            </div>
          </div>

          <div ref={printRef} className="p-4">
            <div className="header hidden print:block">
              <h1>{report.organization}</h1>
              <p>{getReportTitle()} - {months[report.period.month - 1]} {report.period.year}</p>
              <p>Generado: {new Date(report.generated_at).toLocaleString("es-NI")}</p>
            </div>

            {reportType === "ir" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left">Cedula</th>
                        <th className="px-3 py-2 text-left">No. INSS</th>
                        <th className="px-3 py-2 text-left">Nombre</th>
                        <th className="px-3 py-2 text-left">Cargo</th>
                        <th className="px-3 py-2 text-right">Salario</th>
                        <th className="px-3 py-2 text-right">Comisiones</th>
                        <th className="px-3 py-2 text-right">Total Bruto</th>
                        <th className="px-3 py-2 text-right">IR Mensual</th>
                        <th className="px-3 py-2 text-right">IR Anual</th>
                        <th className="px-3 py-2 text-center">Tasa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.cedula}</td>
                          <td className="px-3 py-2">{row.inss_number}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.position}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.salary)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.commissions)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.total_gross)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.monthly_ir)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.annual_ir)}</td>
                          <td className="px-3 py-2 text-center">{row.ir_bracket}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-semibold bg-slate-50">
                        <td colSpan={4} className="px-3 py-2">TOTALES</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_salaries)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_commissions)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_gross)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_monthly_ir)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_annual_ir)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {reportType === "inss" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left">Cedula</th>
                        <th className="px-3 py-2 text-left">No. INSS</th>
                        <th className="px-3 py-2 text-left">Nombre</th>
                        <th className="px-3 py-2 text-left">Cargo</th>
                        <th className="px-3 py-2 text-right">Salario</th>
                        <th className="px-3 py-2 text-right">Comisiones</th>
                        <th className="px-3 py-2 text-right">Total Bruto</th>
                        <th className="px-3 py-2 text-right">INSS Laboral (7%)</th>
                        <th className="px-3 py-2 text-right">INSS Patronal ({report.data[0]?.employer_inss_rate || 21.5}%)</th>
                        <th className="px-3 py-2 text-right">Total INSS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.cedula}</td>
                          <td className="px-3 py-2">{row.inss_number}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.position}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.salary)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.commissions)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.total_gross)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.employee_inss)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.employer_inss)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.total_inss)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-semibold bg-slate-50">
                        <td colSpan={4} className="px-3 py-2">TOTALES</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_salaries)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_commissions)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_gross)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_employee_inss)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_employer_inss)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_inss)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {reportType === "salarios" && (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-3 py-2 text-left">Cedula</th>
                        <th className="px-3 py-2 text-left">Nombre</th>
                        <th className="px-3 py-2 text-left">Cargo</th>
                        <th className="px-3 py-2 text-right">Salario</th>
                        <th className="px-3 py-2 text-right">Comisiones</th>
                        <th className="px-3 py-2 text-right">Salario Bruto</th>
                        <th className="px-3 py-2 text-right">INSS</th>
                        <th className="px-3 py-2 text-right">IR</th>
                        <th className="px-3 py-2 text-right">Salario Neto</th>
                        <th className="px-3 py-2 text-left">Banco</th>
                        <th className="px-3 py-2 text-left">Cuenta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.data.map((row, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{row.cedula}</td>
                          <td className="px-3 py-2">{row.name}</td>
                          <td className="px-3 py-2">{row.position}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.salary)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.commissions)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(row.gross_salary)}</td>
                          <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(row.inss_deduction)}</td>
                          <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(row.ir_deduction)}</td>
                          <td className="px-3 py-2 text-right font-medium text-green-600">{formatCurrency(row.net_salary)}</td>
                          <td className="px-3 py-2">{row.bank_name}</td>
                          <td className="px-3 py-2">{row.bank_account}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 font-semibold bg-slate-50">
                        <td colSpan={3} className="px-3 py-2">TOTALES</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_salaries)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_commissions)}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(report.totals.total_gross)}</td>
                        <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(report.totals.total_inss)}</td>
                        <td className="px-3 py-2 text-right text-red-600">-{formatCurrency(report.totals.total_ir)}</td>
                        <td className="px-3 py-2 text-right text-green-600">{formatCurrency(report.totals.total_net)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <div className="footer mt-4 text-xs text-slate-500 print:block">
              <p>Generado el {new Date(report.generated_at).toLocaleString("es-NI")}</p>
              <p>Este documento es para uso interno y declaraciones ante la DGI/INSS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}