"use client";

import React, { useState, useMemo, useRef } from "react";
import {
  calculateNetSalary,
  calculateVacationDays,
  calculateAguinaldo,
  calculateVacationPay,
  calculateLiquidation,
  calculateEmployerINSS,
  LABOR_CONFIG,
} from "../services/laborConfig";

export default function PayrollCalculator() {
  const [activeTab, setActiveTab] = useState("nomina");
  const [salary, setSalary] = useState("");
  const [commissions, setCommissions] = useState("");
  const [monthsWorked, setMonthsWorked] = useState("12");
  const [vacationDaysUsed, setVacationDaysUsed] = useState("0");
  const [hireDate, setHireDate] = useState("");
  const [aguinaldoPaid, setAguinaldoPaid] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const printRef = useRef(null);

  const calculations = useMemo(() => {
    const grossSalary = parseFloat(salary) || 0;
    const commissionsAmount = parseFloat(commissions) || 0;
    const months = parseInt(monthsWorked) || 0;
    const usedDays = parseInt(vacationDaysUsed) || 0;

    if (grossSalary <= 0) return null;

    const payroll = calculateNetSalary(grossSalary, commissionsAmount);
    const vacationDaysAccrued = calculateVacationDays(months);
    const vacationDaysAvailable = Math.max(0, vacationDaysAccrued - usedDays);
    const dailySalary = grossSalary / 30;
    const vacationPay = calculateVacationPay(dailySalary, vacationDaysAvailable);
    const aguinaldo = calculateAguinaldo(grossSalary, Math.min(months, 12));
    const employerINSS = calculateEmployerINSS(grossSalary + commissionsAmount);

    return {
      payroll,
      vacation: {
        accrued: vacationDaysAccrued,
        used: usedDays,
        available: vacationDaysAvailable,
        pay: vacationPay,
      },
      aguinaldo,
      employerINSS,
      annualCost: {
        grossAnnual: grossSalary * 12,
        commissionsAnnual: commissionsAmount * 12,
        employerINSSAnnual: employerINSS * 12,
        aguinaldo,
        totalCost: (grossSalary + commissionsAmount) * 12 + aguinaldo + (employerINSS * 12),
      },
    };
  }, [salary, commissions, monthsWorked, vacationDaysUsed]);

  const liquidation = useMemo(() => {
    const grossSalary = parseFloat(salary) || 0;
    const usedDays = parseInt(vacationDaysUsed) || 0;

    if (grossSalary <= 0 || !hireDate) return null;

    return calculateLiquidation(grossSalary, hireDate, usedDays, aguinaldoPaid);
  }, [salary, hireDate, vacationDaysUsed, aguinaldoPaid]);

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
          <title>Planilla - ${employeeName || "Empleado"}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 18px; }
            .header p { margin: 5px 0; color: #666; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; margin-bottom: 5px; }
            .row { display: flex; justify-content: space-between; padding: 3px 5px; border-bottom: 1px dotted #ddd; }
            .row.total { font-weight: bold; border-top: 2px solid #333; border-bottom: none; margin-top: 5px; padding-top: 5px; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-line { width: 200px; text-align: center; }
            .signature-line hr { margin-bottom: 5px; }
            .date { text-align: right; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>AgroCentro ERP - Comprobante de Pago</h1>
            <p>Planilla de Nómina</p>
          </div>
          <div class="date">Fecha: ${new Date().toLocaleDateString("es-NI")}</div>
          
          <div class="section">
            <div class="section-title">Datos del Empleado</div>
            <div class="row"><span>Nombre:</span><span>${employeeName || "_______________"}</span></div>
            <div class="row"><span>ID/Cédula:</span><span>${employeeId || "_______________"}</span></div>
            <div class="row"><span>Período:</span><span>${new Date().toLocaleDateString("es-NI", { month: "long", year: "numeric" })}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Ingresos</div>
            <div class="row"><span>Salario Base:</span><span>${formatCurrency(calculations?.payroll?.grossSalary)}</span></div>
            ${calculations?.payroll?.commissions > 0 ? `<div class="row"><span>Comisiones:</span><span>${formatCurrency(calculations?.payroll?.commissions)}</span></div>` : ""}
            <div class="row total"><span>Total Ingresos:</span><span>${formatCurrency(calculations?.payroll?.totalGross)}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Deducciones</div>
            <div class="row"><span>INSS Laboral (7%):</span><span>${formatCurrency(calculations?.payroll?.inss)}</span></div>
            <div class="row"><span>IR (Impuesto sobre la Renta):</span><span>${formatCurrency(calculations?.payroll?.ir)}</span></div>
            <div class="row total"><span>Total Deducciones:</span><span>${formatCurrency(calculations?.payroll?.totalDeductions)}</span></div>
          </div>

          <div class="section">
            <div class="section-title">Neto a Pagar</div>
            <div class="row total" style="font-size: 14px;"><span>SALARIO NETO:</span><span>${formatCurrency(calculations?.payroll?.netSalary)}</span></div>
          </div>

          <div class="signature">
            <div class="signature-line">
              <hr />
              <span>Firma del Empleado</span>
            </div>
            <div class="signature-line">
              <hr />
              <span>Firma del Empleador</span>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("nomina")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "nomina" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500"}`}
        >
          Calculadora de Nómina
        </button>
        <button
          onClick={() => setActiveTab("liquidacion")}
          className={`px-4 py-2 text-sm font-medium ${activeTab === "liquidacion" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500"}`}
        >
          Calculadora de Prestaciones
        </button>
      </div>

      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">
          {activeTab === "nomina" ? "Calculadora de Nómina - Ley Laboral Nicaragüense" : "Calculadora de Prestaciones / Liquidación"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del Empleado</label>
            <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} placeholder="Juan Pérez" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cédula / ID</label>
            <input type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} placeholder="001-010190-0001A" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Salario Mensual Bruto (C$)</label>
            <input type="number" value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="15000" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Comisiones (C$)</label>
            <input type="number" value={commissions} onChange={(e) => setCommissions(e.target.value)} placeholder="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
        </div>

        {activeTab === "nomina" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Meses Trabajados</label>
              <input type="number" value={monthsWorked} onChange={(e) => setMonthsWorked(e.target.value)} min="0" max="120" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Días de Vacaciones Usados</label>
              <input type="number" value={vacationDaysUsed} onChange={(e) => setVacationDaysUsed(e.target.value)} min="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        )}

        {activeTab === "liquidacion" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Contratación</label>
              <input type="date" value={hireDate} onChange={(e) => setHireDate(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Días de Vacaciones Usados</label>
              <input type="number" value={vacationDaysUsed} onChange={(e) => setVacationDaysUsed(e.target.value)} min="0" className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={aguinaldoPaid} onChange={(e) => setAguinaldoPaid(e.target.checked)} className="rounded" />
                <span>Aguinaldo ya pagado este año</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {activeTab === "nomina" && calculations && (
        <div ref={printRef}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Desglose Mensual</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Salario Base</span><span className="font-medium">{formatCurrency(calculations.payroll.grossSalary)}</span></div>
                {calculations.payroll.commissions > 0 && (
                  <div className="flex justify-between text-green-600"><span>+ Comisiones</span><span>{formatCurrency(calculations.payroll.commissions)}</span></div>
                )}
                <div className="flex justify-between font-medium border-t pt-1"><span>Total Bruto</span><span>{formatCurrency(calculations.payroll.totalGross)}</span></div>
                <div className="flex justify-between text-red-600"><span>INSS (7%)</span><span>- {formatCurrency(calculations.payroll.inss)}</span></div>
                <div className="flex justify-between text-red-600"><span>IR (según tabla)</span><span>- {formatCurrency(calculations.payroll.ir)}</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Salario Neto</span><span className="text-emerald-600">{formatCurrency(calculations.payroll.netSalary)}</span></div>
              </div>
            </div>

            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Vacaciones</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-600">Días Acumulados</span><span className="font-medium">{calculations.vacation.accrued} días</span></div>
                <div className="flex justify-between"><span className="text-slate-600">Días Usados</span><span>{calculations.vacation.used} días</span></div>
                <div className="flex justify-between text-blue-600"><span>Días Disponibles</span><span className="font-medium">{calculations.vacation.available} días</span></div>
                <div className="border-t pt-2 flex justify-between font-semibold"><span>Valor Vacaciones (+25%)</span><span className="text-blue-600">{formatCurrency(calculations.vacation.pay)}</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-3">Aguinaldo (Décimo Tercer Mes)</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-amber-600">{parseInt(monthsWorked) >= 12 ? "Año completo trabajado" : `${monthsWorked} meses (proporcional)`}</p>
                  <p className="text-xs text-amber-500 mt-1">Pago antes del 10 de diciembre</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(calculations.aguinaldo)}</p>
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-indigo-700 mb-3">Costo Total Empleador</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span className="text-indigo-600">Salarios (12 meses)</span><span>{formatCurrency(calculations.annualCost.grossAnnual)}</span></div>
                <div className="flex justify-between"><span className="text-indigo-600">INSS Patronal (21.5%)</span><span>{formatCurrency(calculations.annualCost.employerINSSAnnual)}</span></div>
                <div className="flex justify-between"><span className="text-indigo-600">Aguinaldo</span><span>{formatCurrency(calculations.aguinaldo)}</span></div>
                <div className="border-t pt-1 flex justify-between font-semibold"><span>Total Anual</span><span className="text-indigo-700">{formatCurrency(calculations.annualCost.totalCost)}</span></div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={handlePrint} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 flex items-center gap-2">
              <span>Imprimir Planilla</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === "liquidacion" && liquidation && (
        <div className="space-y-4">
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Resumen de Tiempo Laborado</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-700">{liquidation.yearsWorked}</p>
                <p className="text-xs text-slate-500">Años</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-700">{liquidation.monthsWorked % 12}</p>
                <p className="text-xs text-slate-500">Meses</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-slate-700">{formatCurrency(liquidation.dailySalary)}</p>
                <p className="text-xs text-slate-500">Salario Diario</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">Vacaciones No Gozadas</h4>
              <p className="text-xs text-blue-600 mb-2">{liquidation.vacationDaysAvailable} días disponibles (+25% bono)</p>
              <p className="text-xl font-bold text-blue-700">{formatCurrency(liquidation.vacationPay)}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-700 mb-2">Aguinaldo Proporcional</h4>
              <p className="text-xs text-amber-600 mb-2">{liquidation.monthsForAguinaldo} meses del año actual</p>
              <p className="text-xl font-bold text-amber-700">{formatCurrency(liquidation.proportionalAguinaldo)}</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-purple-700 mb-2">Indemnización</h4>
              <p className="text-xs text-purple-600 mb-2">{Math.min(liquidation.yearsWorked, 5)} años (máx. 5)</p>
              <p className="text-xl font-bold text-purple-700">{formatCurrency(liquidation.severancePay)}</p>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-lg font-semibold text-emerald-700">Total Prestaciones a Pagar</h4>
                <p className="text-xs text-emerald-600">Vacaciones + Aguinaldo + Indemnización</p>
              </div>
              <p className="text-3xl font-bold text-emerald-700">{formatCurrency(liquidation.total)}</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button onClick={() => {
              const printWindow = window.open("", "_blank");
              printWindow.document.write(`
                <html><head><title>Liquidación - ${employeeName}</title>
                <style>body{font-family:Arial;padding:20px;font-size:12px}.header{text-align:center;border-bottom:2px solid #333;padding-bottom:10px;margin-bottom:20px}.row{display:flex;justify-content:space-between;padding:5px;border-bottom:1px dotted #ddd}.total{font-weight:bold;font-size:14px;border-top:2px solid #333;margin-top:10px;padding-top:10px}.signature{margin-top:50px;display:flex;justify-content:space-between}.sig-line{width:200px;text-align:center}hr{margin-bottom:5px}</style>
                </head><body>
                <div class="header"><h1>Liquidación de Prestaciones Laborales</h1><p>AgroCentro ERP</p></div>
                <p><strong>Empleado:</strong> ${employeeName || "___"}</p>
                <p><strong>Cédula:</strong> ${employeeId || "___"}</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-NI")}</p>
                <p><strong>Tiempo laborado:</strong> ${liquidation.yearsWorked} años, ${liquidation.monthsWorked % 12} meses</p>
                <hr style="margin:20px 0"/>
                <div class="row"><span>Vacaciones no gozadas (${liquidation.vacationDaysAvailable} días):</span><span>${formatCurrency(liquidation.vacationPay)}</span></div>
                <div class="row"><span>Aguinaldo proporcional (${liquidation.monthsForAguinaldo} meses):</span><span>${formatCurrency(liquidation.proportionalAguinaldo)}</span></div>
                <div class="row"><span>Indemnización (${Math.min(liquidation.yearsWorked, 5)} años):</span><span>${formatCurrency(liquidation.severancePay)}</span></div>
                <div class="row total"><span>TOTAL A PAGAR:</span><span>${formatCurrency(liquidation.total)}</span></div>
                <div class="signature"><div class="sig-line"><hr/><span>Firma Empleado</span></div><div class="sig-line"><hr/><span>Firma Empleador</span></div></div>
                </body></html>
              `);
              printWindow.document.close();
              printWindow.print();
            }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800">
              Imprimir Liquidación
            </button>
          </div>
        </div>
      )}

      {!calculations && activeTab === "nomina" && (
        <div className="text-center py-8 text-slate-400">Ingresa un salario para ver los cálculos</div>
      )}

      {!liquidation && activeTab === "liquidacion" && (
        <div className="text-center py-8 text-slate-400">Ingresa salario y fecha de contratación para calcular prestaciones</div>
      )}
    </div>
  );
}