"use client";

import React, { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { calculateNetSalary, calculateEmployerINSS, LABOR_CONFIG } from "../services/laborConfig";

export default function PayrollSheet({ employees, orgName = "Mi Empresa", orgSlug }) {
  const [showEmployerCosts, setShowEmployerCosts] = useState(true);
  const [showProvisions, setShowProvisions] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo" && emp.salary > 0);
  }, [employees]);

  const payrollData = useMemo(() => {
    return activeEmployees.map((emp) => {
      const calc = calculateNetSalary(emp.salary || 0, emp.commissions || 0);
      const employerINSS = calculateEmployerINSS(calc.totalGross, activeEmployees.length);
      const aguinaldoProvision = calc.totalGross / 12;
      const vacationProvision = (calc.totalGross / 12) * 1.25;
      const totalEmployerCost = calc.totalGross + employerINSS + aguinaldoProvision + vacationProvision;
      
      return {
        ...emp,
        calc,
        employerINSS,
        aguinaldoProvision,
        vacationProvision,
        totalEmployerCost,
      };
    });
  }, [activeEmployees]);

  const totals = useMemo(() => {
    return payrollData.reduce(
      (acc, emp) => ({
        salary: acc.salary + (emp.calc?.grossSalary || 0),
        commissions: acc.commissions + (emp.calc?.commissions || 0),
        grossSalary: acc.grossSalary + (emp.calc?.totalGross || 0),
        inss: acc.inss + (emp.calc?.inss || 0),
        ir: acc.ir + (emp.calc?.ir || 0),
        netSalary: acc.netSalary + (emp.calc?.netSalary || 0),
        employerINSS: acc.employerINSS + (emp.employerINSS || 0),
        aguinaldoProvision: acc.aguinaldoProvision + (emp.aguinaldoProvision || 0),
        vacationProvision: acc.vacationProvision + (emp.vacationProvision || 0),
        totalEmployerCost: acc.totalEmployerCost + (emp.totalEmployerCost || 0),
      }),
      { 
        salary: 0, commissions: 0, grossSalary: 0, inss: 0, ir: 0, netSalary: 0,
        employerINSS: 0, aguinaldoProvision: 0, vacationProvision: 0, totalEmployerCost: 0
      }
    );
  }, [payrollData]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const currentDate = new Date().toLocaleDateString("es-NI", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentPeriod = new Date().toLocaleDateString("es-NI", {
    year: "numeric",
    month: "long",
  });

  const handleExportExcel = () => {
    const headers = [
      "No.", "Nombre", "Cedula", "Cargo", "Departamento",
      "Salario", "Comisiones", "Total Bruto", "INSS 7%", "IR", "Neto a Pagar",
      "INSS Patronal", "Prov. Aguinaldo", "Prov. Vacaciones", "Costo Total Empleador"
    ];

    const rows = payrollData.map((emp, idx) => [
      idx + 1,
      emp.name || "",
      emp.cedula || "",
      emp.position || "",
      emp.department || "",
      emp.calc?.grossSalary || 0,
      emp.calc?.commissions || 0,
      emp.calc?.totalGross || 0,
      emp.calc?.inss || 0,
      emp.calc?.ir || 0,
      emp.calc?.netSalary || 0,
      emp.employerINSS || 0,
      emp.aguinaldoProvision || 0,
      emp.vacationProvision || 0,
      emp.totalEmployerCost || 0,
    ]);

    const totalsRow = [
      "", "TOTALES", "", "", "",
      totals.salary,
      totals.commissions,
      totals.grossSalary,
      totals.inss,
      totals.ir,
      totals.netSalary,
      totals.employerINSS,
      totals.aguinaldoProvision,
      totals.vacationProvision,
      totals.totalEmployerCost,
    ];
    
    rows.push(totalsRow);

    const wsData = [
      [`Planilla de Nomina - ${orgName}`],
      [`Periodo: ${currentPeriod}`],
      [`Fecha: ${currentDate}`],
      [],
      headers,
      ...rows
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    ws["!cols"] = [
      { wch: 5 },
      { wch: 25 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planilla");

    XLSX.writeFile(wb, `planilla_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleSavePayroll = async () => {
    if (!orgSlug) {
      alert("Error: No se pudo identificar la organizacion");
      return;
    }

    try {
      setSaving(true);
      const now = new Date();
      const res = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          periodMonth: now.getMonth() + 1,
          periodYear: now.getFullYear(),
          totals: {
            totalEmployees: payrollData.length,
            totalGross: totals.grossSalary,
            totalInss: totals.inss,
            totalIr: totals.ir,
            totalNet: totals.netSalary,
            totalEmployerInss: totals.employerINSS,
            totalAguinaldoProvision: totals.aguinaldoProvision,
            totalVacationProvision: totals.vacationProvision,
            totalEmployerCost: totals.totalEmployerCost,
          },
          items: payrollData.map((emp) => ({
            employeeId: emp.id,
            employeeName: emp.name,
            employeeCedula: emp.cedula,
            employeePosition: emp.position,
            employeeDepartment: emp.department,
            salary: emp.calc?.grossSalary || 0,
            commissions: emp.calc?.commissions || 0,
            totalGross: emp.calc?.totalGross || 0,
            inss: emp.calc?.inss || 0,
            ir: emp.calc?.ir || 0,
            netSalary: emp.calc?.netSalary || 0,
            employerInss: emp.employerINSS || 0,
            aguinaldoProvision: emp.aguinaldoProvision || 0,
            vacationProvision: emp.vacationProvision || 0,
            totalEmployerCost: emp.totalEmployerCost || 0,
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar planilla");
      }

      alert("Planilla guardada exitosamente");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Planilla de Nomina - ${currentPeriod}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 15px; font-size: 10px; line-height: 1.3; }
            .header { text-align: center; margin-bottom: 15px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { font-size: 16px; margin-bottom: 3px; }
            .header h2 { font-size: 13px; font-weight: normal; color: #555; }
            .header p { font-size: 10px; color: #666; margin-top: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px; }
            th { background: #f0f0f0; border: 1px solid #333; padding: 5px 3px; text-align: center; font-weight: bold; font-size: 8px; }
            td { border: 1px solid #333; padding: 4px 3px; text-align: center; }
            td.left { text-align: left; }
            td.right { text-align: right; }
            .totals-row { background: #e8e8e8; font-weight: bold; }
            .signature-section { margin-top: 40px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 180px; }
            .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; font-size: 9px; }
            .footer { margin-top: 20px; text-align: center; font-size: 8px; color: #666; }
            .employee-signature { width: 80px; height: 25px; border-bottom: 1px solid #333; }
            @media print { body { padding: 10px; } @page { size: landscape; margin: 10mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>PLANILLA DE PAGO DE NOMINA</h2>
            <p>Periodo: ${currentPeriod}</p>
          </div>
          <div class="info-row">
            <span>Fecha de elaboracion: ${currentDate}</span>
            <span>Total empleados: ${payrollData.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 25px;">No.</th>
                <th style="width: 120px;">NOMBRE</th>
                <th style="width: 80px;">CEDULA</th>
                <th style="width: 70px;">CARGO</th>
                <th style="width: 65px;">SALARIO</th>
                <th style="width: 60px;">COMISIONES</th>
                <th style="width: 65px;">TOTAL BRUTO</th>
                <th style="width: 55px;">INSS 7%</th>
                <th style="width: 50px;">IR</th>
                <th style="width: 65px;">NETO</th>
                <th style="width: 70px;">FIRMA</th>
              </tr>
            </thead>
            <tbody>
              ${payrollData.map((emp, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td class="left">${emp.name || ""}</td>
                  <td>${emp.cedula || ""}</td>
                  <td class="left">${emp.position || ""}</td>
                  <td class="right">${formatCurrency(emp.calc?.grossSalary)}</td>
                  <td class="right">${formatCurrency(emp.calc?.commissions)}</td>
                  <td class="right">${formatCurrency(emp.calc?.totalGross)}</td>
                  <td class="right">${formatCurrency(emp.calc?.inss)}</td>
                  <td class="right">${formatCurrency(emp.calc?.ir)}</td>
                  <td class="right">${formatCurrency(emp.calc?.netSalary)}</td>
                  <td><div class="employee-signature"></div></td>
                </tr>
              `).join("")}
              <tr class="totals-row">
                <td colspan="4" class="right">TOTALES:</td>
                <td class="right">${formatCurrency(totals.salary)}</td>
                <td class="right">${formatCurrency(totals.commissions)}</td>
                <td class="right">${formatCurrency(totals.grossSalary)}</td>
                <td class="right">${formatCurrency(totals.inss)}</td>
                <td class="right">${formatCurrency(totals.ir)}</td>
                <td class="right">${formatCurrency(totals.netSalary)}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <div class="signature-section">
            <div class="signature-box"><div class="signature-line">Elaborado por</div></div>
            <div class="signature-box"><div class="signature-line">Revisado por</div></div>
            <div class="signature-box"><div class="signature-line">Autorizado por</div></div>
          </div>
          <div class="footer">
            <p>Documento generado el ${currentDate}</p>
            <p>Los calculos se basan en la legislacion laboral nicaraguense vigente (INSS 7%, IR segun tabla DGI)</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (activeEmployees.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>No hay empleados activos con salario registrado</p>
        <p className="text-xs mt-2">Agrega empleados con salario para generar la planilla</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Planilla General de Nomina</h3>
          <p className="text-xs text-slate-500">Periodo: {currentPeriod} | {activeEmployees.length} empleados activos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportExcel} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 flex items-center gap-2 min-h-[44px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
          <button onClick={handlePrint} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800 flex items-center gap-2 min-h-[44px]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showEmployerCosts} onChange={(e) => setShowEmployerCosts(e.target.checked)} className="rounded" />
          Mostrar costos patronales
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showProvisions} onChange={(e) => setShowProvisions(e.target.checked)} className="rounded" />
          Mostrar provisiones
        </label>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase tracking-wide text-slate-600">
              <th className="px-2 py-2 text-center w-10">No.</th>
              <th className="px-3 py-2 text-left">Empleado</th>
              <th className="px-3 py-2 text-left">Cedula</th>
              <th className="px-3 py-2 text-left">Cargo</th>
              <th className="px-3 py-2 text-right">Salario</th>
              <th className="px-3 py-2 text-right">Comisiones</th>
              <th className="px-3 py-2 text-right">Total Bruto</th>
              <th className="px-3 py-2 text-right">INSS 7%</th>
              <th className="px-3 py-2 text-right">IR</th>
              <th className="px-3 py-2 text-right">Neto</th>
              {showEmployerCosts && <th className="px-3 py-2 text-right bg-amber-50">INSS Pat.</th>}
              {showProvisions && (
                <>
                  <th className="px-3 py-2 text-right bg-purple-50">Aguin.</th>
                  <th className="px-3 py-2 text-right bg-purple-50">Vac.</th>
                </>
              )}
              {(showEmployerCosts || showProvisions) && <th className="px-3 py-2 text-right bg-orange-50">Costo Total</th>}
            </tr>
          </thead>
          <tbody>
            {payrollData.map((emp, idx) => (
              <tr key={emp.id} className="border-b hover:bg-slate-50">
                <td className="px-2 py-2 text-center text-slate-500">{idx + 1}</td>
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-800">{emp.name}</p>
                  <p className="text-xs text-slate-400">{emp.department}</p>
                </td>
                <td className="px-3 py-2 text-slate-600">{emp.cedula || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{emp.position || "—"}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(emp.calc?.grossSalary)}</td>
                <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(emp.calc?.commissions)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(emp.calc?.totalGross)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatCurrency(emp.calc?.inss)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatCurrency(emp.calc?.ir)}</td>
                <td className="px-3 py-2 text-right font-semibold text-emerald-600">{formatCurrency(emp.calc?.netSalary)}</td>
                {showEmployerCosts && <td className="px-3 py-2 text-right bg-amber-50 text-amber-700">{formatCurrency(emp.employerINSS)}</td>}
                {showProvisions && (
                  <>
                    <td className="px-3 py-2 text-right bg-purple-50 text-purple-700">{formatCurrency(emp.aguinaldoProvision)}</td>
                    <td className="px-3 py-2 text-right bg-purple-50 text-purple-700">{formatCurrency(emp.vacationProvision)}</td>
                  </>
                )}
                {(showEmployerCosts || showProvisions) && <td className="px-3 py-2 text-right bg-orange-50 font-semibold text-orange-700">{formatCurrency(emp.totalEmployerCost)}</td>}
              </tr>
            ))}
            <tr className="bg-slate-100 font-semibold">
              <td colSpan={4} className="px-3 py-3 text-right">TOTALES:</td>
              <td className="px-3 py-3 text-right">{formatCurrency(totals.salary)}</td>
              <td className="px-3 py-3 text-right text-blue-600">{formatCurrency(totals.commissions)}</td>
              <td className="px-3 py-3 text-right">{formatCurrency(totals.grossSalary)}</td>
              <td className="px-3 py-3 text-right text-red-600">{formatCurrency(totals.inss)}</td>
              <td className="px-3 py-3 text-right text-red-600">{formatCurrency(totals.ir)}</td>
              <td className="px-3 py-3 text-right text-emerald-600">{formatCurrency(totals.netSalary)}</td>
              {showEmployerCosts && <td className="px-3 py-3 text-right bg-amber-50 text-amber-700">{formatCurrency(totals.employerINSS)}</td>}
              {showProvisions && (
                <>
                  <td className="px-3 py-3 text-right bg-purple-50 text-purple-700">{formatCurrency(totals.aguinaldoProvision)}</td>
                  <td className="px-3 py-3 text-right bg-purple-50 text-purple-700">{formatCurrency(totals.vacationProvision)}</td>
                </>
              )}
              {(showEmployerCosts || showProvisions) && <td className="px-3 py-3 text-right bg-orange-50 text-orange-700">{formatCurrency(totals.totalEmployerCost)}</td>}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-slate-50 border rounded-lg p-4">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Resumen de Nomina</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500">Empleados</p><p className="font-semibold">{payrollData.length}</p></div>
            <div><p className="text-slate-500">Total Bruto</p><p className="font-semibold">{formatCurrency(totals.grossSalary)}</p></div>
            <div><p className="text-slate-500">Total Deducciones</p><p className="font-semibold text-red-600">{formatCurrency(totals.inss + totals.ir)}</p></div>
            <div><p className="text-slate-500">Total a Pagar</p><p className="font-semibold text-emerald-600">{formatCurrency(totals.netSalary)}</p></div>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-700 mb-3">Costos Patronales</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-slate-500">INSS Patronal (21.5%)</p><p className="font-semibold text-amber-700">{formatCurrency(totals.employerINSS)}</p></div>
            <div><p className="text-slate-500">Prov. Aguinaldo (8.33%)</p><p className="font-semibold text-amber-700">{formatCurrency(totals.aguinaldoProvision)}</p></div>
            <div><p className="text-slate-500">Prov. Vacaciones (10.42%)</p><p className="font-semibold text-amber-700">{formatCurrency(totals.vacationProvision)}</p></div>
            <div><p className="text-slate-500">Costo Total Empleador</p><p className="font-semibold text-orange-700">{formatCurrency(totals.totalEmployerCost)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}