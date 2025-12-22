"use client";

import React, { useState, useMemo } from "react";
import { calculateNetSalary, calculateEmployerINSS } from "../services/laborConfig";

export default function PayrollHistory({ employees, orgSlug, onSavePayroll }) {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState(null);
  const [saving, setSaving] = useState(false);

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo" && emp.salary > 0);
  }, [employees]);

  const currentPayroll = useMemo(() => {
    return activeEmployees.map((emp) => {
      const calc = calculateNetSalary(emp.salary || 0, emp.commissions || 0);
      const employerINSS = calculateEmployerINSS(calc.totalGross, activeEmployees.length);
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        cedula: emp.cedula,
        position: emp.position,
        department: emp.department,
        salary: emp.salary,
        commissions: emp.commissions || 0,
        ...calc,
        employerINSS,
      };
    });
  }, [activeEmployees]);

  const totals = useMemo(() => {
    const data = selectedRun ? selectedRun.items : currentPayroll;
    return data.reduce(
      (acc, emp) => ({
        grossSalary: acc.grossSalary + (emp.totalGross || 0),
        inss: acc.inss + (emp.inss || 0),
        ir: acc.ir + (emp.ir || 0),
        netSalary: acc.netSalary + (emp.netSalary || 0),
        employerINSS: acc.employerINSS + (emp.employerINSS || 0),
      }),
      { grossSalary: 0, inss: 0, ir: 0, netSalary: 0, employerINSS: 0 }
    );
  }, [currentPayroll, selectedRun]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleSavePayroll = async () => {
    setSaving(true);
    const now = new Date();
    const period = now.toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    
    const newRun = {
      id: Date.now().toString(),
      period,
      createdAt: now.toISOString(),
      employeeCount: currentPayroll.length,
      totalGross: totals.grossSalary,
      totalNet: totals.netSalary,
      totalDeductions: totals.inss + totals.ir,
      items: currentPayroll,
    };

    if (onSavePayroll) {
      try {
        await onSavePayroll(newRun);
      } catch (err) {
        console.error("Error saving payroll:", err);
      }
    }

    setPayrollRuns((prev) => [newRun, ...prev]);
    setSaving(false);
    alert(`Planilla guardada para ${period}`);
  };

  const displayData = selectedRun ? selectedRun.items : currentPayroll;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Historial de Planillas</h3>
          <p className="text-xs text-slate-500">
            {selectedRun ? `Viendo: ${selectedRun.period}` : "Planilla actual (sin guardar)"}
          </p>
        </div>
        <div className="flex gap-2">
          {selectedRun && (
            <button onClick={() => setSelectedRun(null)} className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs hover:bg-slate-300">
              Ver Actual
            </button>
          )}
          {!selectedRun && (
            <button onClick={handleSavePayroll} disabled={saving || activeEmployees.length === 0} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar Planilla"}
            </button>
          )}
        </div>
      </div>

      {payrollRuns.length > 0 && (
        <div className="bg-slate-50 border rounded-lg p-3">
          <p className="text-xs font-medium text-slate-600 mb-2">Planillas Guardadas:</p>
          <div className="flex flex-wrap gap-2">
            {payrollRuns.map((run) => (
              <button
                key={run.id}
                onClick={() => setSelectedRun(run)}
                className={`px-3 py-1.5 text-xs rounded-lg border ${
                  selectedRun?.id === run.id
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                }`}
              >
                {run.period} ({run.employeeCount} emp.)
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2 text-left">Empleado</th>
              <th className="px-3 py-2 text-left">Cargo</th>
              <th className="px-3 py-2 text-right">Salario</th>
              <th className="px-3 py-2 text-right">Comisiones</th>
              <th className="px-3 py-2 text-right">Bruto</th>
              <th className="px-3 py-2 text-right">INSS</th>
              <th className="px-3 py-2 text-right">IR</th>
              <th className="px-3 py-2 text-right">Neto</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((emp, idx) => (
              <tr key={emp.employeeId || idx} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">
                  <p className="font-medium text-slate-800">{emp.employeeName || emp.name}</p>
                  <p className="text-xs text-slate-400">{emp.cedula}</p>
                </td>
                <td className="px-3 py-2 text-slate-600">{emp.position}</td>
                <td className="px-3 py-2 text-right">{formatCurrency(emp.grossSalary || emp.salary)}</td>
                <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(emp.commissions)}</td>
                <td className="px-3 py-2 text-right font-medium">{formatCurrency(emp.totalGross)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatCurrency(emp.inss)}</td>
                <td className="px-3 py-2 text-right text-red-600">{formatCurrency(emp.ir)}</td>
                <td className="px-3 py-2 text-right font-semibold text-emerald-600">{formatCurrency(emp.netSalary)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-semibold">
              <td colSpan={4} className="px-3 py-2 text-right">TOTALES:</td>
              <td className="px-3 py-2 text-right">{formatCurrency(totals.grossSalary)}</td>
              <td className="px-3 py-2 text-right text-red-600">{formatCurrency(totals.inss)}</td>
              <td className="px-3 py-2 text-right text-red-600">{formatCurrency(totals.ir)}</td>
              <td className="px-3 py-2 text-right text-emerald-600">{formatCurrency(totals.netSalary)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">
          {selectedRun ? `Resumen - ${selectedRun.period}` : "Resumen Actual"}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-xl font-bold text-slate-700">{displayData.length}</p><p className="text-xs text-slate-500">Empleados</p></div>
          <div><p className="text-xl font-bold text-slate-700">{formatCurrency(totals.grossSalary)}</p><p className="text-xs text-slate-500">Total Bruto</p></div>
          <div><p className="text-xl font-bold text-red-600">{formatCurrency(totals.inss + totals.ir)}</p><p className="text-xs text-slate-500">Deducciones</p></div>
          <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netSalary)}</p><p className="text-xs text-slate-500">Total Neto</p></div>
        </div>
      </div>
    </div>
  );
}