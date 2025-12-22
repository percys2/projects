"use client";

import React, { useMemo, useState } from "react";
import { calculateNetSalary, calculateEmployerINSS, LABOR_CONFIG } from "../services/laborConfig";

export default function ComplianceReports({ employees, orgName = "Mi Empresa" }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo" && emp.salary > 0);
  }, [employees]);

  const payrollData = useMemo(() => {
    return activeEmployees.map((emp) => {
      const calc = calculateNetSalary(emp.salary || 0, emp.commissions || 0);
      const employerINSS = calculateEmployerINSS(calc.totalGross, activeEmployees.length);
      return { ...emp, calc, employerINSS };
    });
  }, [activeEmployees]);

  const totals = useMemo(() => {
    return payrollData.reduce(
      (acc, emp) => ({
        grossSalary: acc.grossSalary + (emp.calc?.totalGross || 0),
        employeeINSS: acc.employeeINSS + (emp.calc?.inss || 0),
        employerINSS: acc.employerINSS + (emp.employerINSS || 0),
        ir: acc.ir + (emp.calc?.ir || 0),
        netSalary: acc.netSalary + (emp.calc?.netSalary || 0),
      }),
      { grossSalary: 0, employeeINSS: 0, employerINSS: 0, ir: 0, netSalary: 0 }
    );
  }, [payrollData]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const monthName = new Date(selectedMonth + "-01").toLocaleDateString("es-NI", { year: "numeric", month: "long" });

  const handlePrintINSS = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte INSS - ${monthName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header h2 { font-size: 14px; font-weight: normal; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f0f0f0; border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #333; padding: 6px; }
            td.left { text-align: left; }
            td.right { text-align: right; }
            .totals-row { background: #e8e8e8; font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; border: 1px solid #333; background: #f9f9f9; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>REPORTE DE COTIZACIONES INSS</h2>
            <p>Periodo: ${monthName}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre del Trabajador</th>
                <th>No. INSS</th>
                <th>Cedula</th>
                <th>Salario Bruto</th>
                <th>INSS Laboral (7%)</th>
                <th>INSS Patronal (${(LABOR_CONFIG.inss.employerRateSmall * 100).toFixed(1)}%)</th>
              </tr>
            </thead>
            <tbody>
              ${payrollData.map((emp, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="left">${emp.name || ""}</td>
                  <td>${emp.inss_number || "—"}</td>
                  <td>${emp.cedula || ""}</td>
                  <td class="right">${formatCurrency(emp.calc?.totalGross)}</td>
                  <td class="right">${formatCurrency(emp.calc?.inss)}</td>
                  <td class="right">${formatCurrency(emp.employerINSS)}</td>
                </tr>
              `).join("")}
              <tr class="totals-row">
                <td colspan="4" class="right">TOTALES:</td>
                <td class="right">${formatCurrency(totals.grossSalary)}</td>
                <td class="right">${formatCurrency(totals.employeeINSS)}</td>
                <td class="right">${formatCurrency(totals.employerINSS)}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary">
            <h3>RESUMEN DE COTIZACIONES</h3>
            <p><strong>Total Salarios Brutos:</strong> ${formatCurrency(totals.grossSalary)}</p>
            <p><strong>Total INSS Laboral (7%):</strong> ${formatCurrency(totals.employeeINSS)}</p>
            <p><strong>Total INSS Patronal:</strong> ${formatCurrency(totals.employerINSS)}</p>
            <p><strong>TOTAL A PAGAR AL INSS:</strong> ${formatCurrency(totals.employeeINSS + totals.employerINSS)}</p>
          </div>
          <div class="signature-section">
            <div class="signature-box"><div class="signature-line">Elaborado por</div></div>
            <div class="signature-box"><div class="signature-line">Autorizado por</div></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintIR = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte IR - ${monthName}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header h2 { font-size: 14px; font-weight: normal; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f0f0f0; border: 1px solid #333; padding: 8px; text-align: center; font-weight: bold; }
            td { border: 1px solid #333; padding: 6px; }
            td.left { text-align: left; }
            td.right { text-align: right; }
            .totals-row { background: #e8e8e8; font-weight: bold; }
            .summary { margin-top: 20px; padding: 15px; border: 1px solid #333; background: #f9f9f9; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>REPORTE DE RETENCIONES IR</h2>
            <p>Periodo: ${monthName}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Nombre del Trabajador</th>
                <th>Cedula</th>
                <th>Salario Bruto</th>
                <th>INSS Laboral</th>
                <th>Base Imponible</th>
                <th>IR Retenido</th>
              </tr>
            </thead>
            <tbody>
              ${payrollData.map((emp, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="left">${emp.name || ""}</td>
                  <td>${emp.cedula || ""}</td>
                  <td class="right">${formatCurrency(emp.calc?.totalGross)}</td>
                  <td class="right">${formatCurrency(emp.calc?.inss)}</td>
                  <td class="right">${formatCurrency((emp.calc?.totalGross || 0) - (emp.calc?.inss || 0))}</td>
                  <td class="right">${formatCurrency(emp.calc?.ir)}</td>
                </tr>
              `).join("")}
              <tr class="totals-row">
                <td colspan="3" class="right">TOTALES:</td>
                <td class="right">${formatCurrency(totals.grossSalary)}</td>
                <td class="right">${formatCurrency(totals.employeeINSS)}</td>
                <td class="right">${formatCurrency(totals.grossSalary - totals.employeeINSS)}</td>
                <td class="right">${formatCurrency(totals.ir)}</td>
              </tr>
            </tbody>
          </table>
          <div class="summary">
            <h3>RESUMEN DE RETENCIONES IR</h3>
            <p><strong>Total Salarios Brutos:</strong> ${formatCurrency(totals.grossSalary)}</p>
            <p><strong>Total Deducciones INSS:</strong> ${formatCurrency(totals.employeeINSS)}</p>
            <p><strong>Total Base Imponible:</strong> ${formatCurrency(totals.grossSalary - totals.employeeINSS)}</p>
            <p><strong>TOTAL IR RETENIDO:</strong> ${formatCurrency(totals.ir)}</p>
          </div>
          <div class="signature-section">
            <div class="signature-box"><div class="signature-line">Elaborado por</div></div>
            <div class="signature-box"><div class="signature-line">Autorizado por</div></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = (type) => {
    let headers, rows, filename;
    if (type === "inss") {
      headers = ["No.", "Nombre", "No. INSS", "Cedula", "Salario Bruto", "INSS Laboral", "INSS Patronal"];
      rows = payrollData.map((emp, idx) => [idx + 1, emp.name || "", emp.inss_number || "", emp.cedula || "", (emp.calc?.totalGross || 0).toFixed(2), (emp.calc?.inss || 0).toFixed(2), (emp.employerINSS || 0).toFixed(2)]);
      rows.push(["", "TOTALES", "", "", totals.grossSalary.toFixed(2), totals.employeeINSS.toFixed(2), totals.employerINSS.toFixed(2)]);
      filename = `reporte_inss_${selectedMonth}.csv`;
    } else {
      headers = ["No.", "Nombre", "Cedula", "Salario Bruto", "INSS Laboral", "Base Imponible", "IR Retenido"];
      rows = payrollData.map((emp, idx) => [idx + 1, emp.name || "", emp.cedula || "", (emp.calc?.totalGross || 0).toFixed(2), (emp.calc?.inss || 0).toFixed(2), ((emp.calc?.totalGross || 0) - (emp.calc?.inss || 0)).toFixed(2), (emp.calc?.ir || 0).toFixed(2)]);
      rows.push(["", "TOTALES", "", totals.grossSalary.toFixed(2), totals.employeeINSS.toFixed(2), (totals.grossSalary - totals.employeeINSS).toFixed(2), totals.ir.toFixed(2)]);
      filename = `reporte_ir_${selectedMonth}.csv`;
    }
    const csvContent = [`Reporte ${type.toUpperCase()} - ${orgName}`, `Periodo: ${monthName}`, "", headers.join(","), ...rows.map(row => row.join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Reportes de Cumplimiento</h3>
          <p className="text-xs text-slate-500">Reportes INSS e IR para declaraciones</p>
        </div>
        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-blue-50">
            <h4 className="text-sm font-semibold text-blue-700">Reporte INSS</h4>
            <p className="text-xs text-slate-500">Cotizaciones al Seguro Social</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">INSS Laboral (7%)</p><p className="text-lg font-bold text-blue-600">{formatCurrency(totals.employeeINSS)}</p></div>
              <div><p className="text-xs text-slate-500">INSS Patronal ({(LABOR_CONFIG.inss.employerRateSmall * 100).toFixed(1)}%)</p><p className="text-lg font-bold text-blue-600">{formatCurrency(totals.employerINSS)}</p></div>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-xs text-slate-600">Total a Pagar al INSS</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(totals.employeeINSS + totals.employerINSS)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrintINSS} className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">Imprimir</button>
              <button onClick={() => handleExportCSV("inss")} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200">Exportar CSV</button>
            </div>
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-amber-50">
            <h4 className="text-sm font-semibold text-amber-700">Reporte IR</h4>
            <p className="text-xs text-slate-500">Retenciones de Impuesto sobre la Renta</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Base Imponible</p><p className="text-lg font-bold text-amber-600">{formatCurrency(totals.grossSalary - totals.employeeINSS)}</p></div>
              <div><p className="text-xs text-slate-500">IR Retenido</p><p className="text-lg font-bold text-amber-600">{formatCurrency(totals.ir)}</p></div>
            </div>
            <div className="bg-amber-100 rounded-lg p-3">
              <p className="text-xs text-slate-600">Total IR a Declarar</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(totals.ir)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrintIR} className="flex-1 px-3 py-2 bg-amber-600 text-white rounded-lg text-xs hover:bg-amber-700">Imprimir</button>
              <button onClick={() => handleExportCSV("ir")} className="flex-1 px-3 py-2 bg-amber-100 text-amber-700 rounded-lg text-xs hover:bg-amber-200">Exportar CSV</button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2 text-left">Empleado</th>
              <th className="px-3 py-2 text-left">No. INSS</th>
              <th className="px-3 py-2 text-right">Salario Bruto</th>
              <th className="px-3 py-2 text-right">INSS Lab.</th>
              <th className="px-3 py-2 text-right">INSS Pat.</th>
              <th className="px-3 py-2 text-right">IR</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2"><p className="font-medium text-slate-800">{emp.name}</p><p className="text-xs text-slate-400">{emp.cedula}</p></td>
                <td className="px-3 py-2 text-slate-600">{emp.inss_number || "—"}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(emp.calc?.totalGross)}</td>
                <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(emp.calc?.inss)}</td>
                <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(emp.employerINSS)}</td>
                <td className="px-3 py-2 text-right text-amber-600">{formatCurrency(emp.calc?.ir)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold">
              <td colSpan={2} className="px-3 py-2 text-right">TOTALES:</td>
              <td className="px-3 py-2 text-right">{formatCurrency(totals.grossSalary)}</td>
              <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(totals.employeeINSS)}</td>
              <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(totals.employerINSS)}</td>
              <td className="px-3 py-2 text-right text-amber-600">{formatCurrency(totals.ir)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

