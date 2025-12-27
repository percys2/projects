"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { calculateNetSalary, calculateEmployerINSS } from "../services/laborConfig";

export default function PayrollHistory({ employees, orgSlug }) {
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedRun, setSelectedRun] = useState(null);

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo" && emp.salary > 0);
  }, [employees]);

  const loadPayrollHistory = useCallback(async () => {
    if (!orgSlug) return;
    try {
      setLoading(true);
      const res = await fetch("/api/hr/payroll", {
        headers: { "x-org-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        const runs = (data.payrolls || []).map((p) => ({
          id: p.id,
          period: p.period_label || `${p.period_month}/${p.period_year}`,
          periodMonth: p.period_month,
          periodYear: p.period_year,
          createdAt: p.created_at,
          employeeCount: p.total_employees,
          totalGross: Number(p.total_gross) || 0,
          totalNet: Number(p.total_net) || 0,
          totalDeductions: (Number(p.total_inss) || 0) + (Number(p.total_ir) || 0),
          totalInss: Number(p.total_inss) || 0,
          totalIr: Number(p.total_ir) || 0,
          totalEmployerInss: Number(p.total_employer_inss) || 0,
          items: [],
        }));
        setPayrollRuns(runs);
      }
    } catch (err) {
      console.error("Error loading payroll history:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadPayrollHistory();
  }, [loadPayrollHistory]);

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
    if (selectedRun && selectedRun.items.length === 0) {
      return {
        grossSalary: selectedRun.totalGross,
        inss: selectedRun.totalInss,
        ir: selectedRun.totalIr,
        netSalary: selectedRun.totalNet,
        employerINSS: selectedRun.totalEmployerInss,
      };
    }
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
    if (!orgSlug) {
      alert("Error: No se pudo identificar la organizacion");
      return;
    }

    try {
      setSaving(true);
      const now = new Date();
      const periodMonth = now.getMonth() + 1;
      const periodYear = now.getFullYear();
      const periodLabel = now.toLocaleDateString("es-NI", { year: "numeric", month: "long" });

      const res = await fetch("/api/hr/payroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          periodMonth,
          periodYear,
          periodLabel,
          totals: {
            totalEmployees: currentPayroll.length,
            totalGross: totals.grossSalary,
            totalInss: totals.inss,
            totalIr: totals.ir,
            totalNet: totals.netSalary,
            totalEmployerInss: totals.employerINSS,
            totalAguinaldoProvision: totals.grossSalary / 12,
            totalVacationProvision: (totals.grossSalary / 12) * 1.25,
            totalEmployerCost: totals.grossSalary + totals.employerINSS + (totals.grossSalary / 12) + ((totals.grossSalary / 12) * 1.25),
          },
          items: currentPayroll.map((emp) => ({
            employeeId: emp.employeeId,
            employeeName: emp.employeeName,
            employeeCedula: emp.cedula,
            employeePosition: emp.position,
            employeeDepartment: emp.department,
            salary: emp.grossSalary || emp.salary,
            commissions: emp.commissions,
            totalGross: emp.totalGross,
            inss: emp.inss,
            ir: emp.ir,
            netSalary: emp.netSalary,
            employerInss: emp.employerINSS,
            aguinaldoProvision: emp.totalGross / 12,
            vacationProvision: (emp.totalGross / 12) * 1.25,
            totalEmployerCost: emp.totalGross + emp.employerINSS + (emp.totalGross / 12) + ((emp.totalGross / 12) * 1.25),
          })),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al guardar planilla");
      }

      alert(`Planilla guardada para ${periodLabel}`);
      await loadPayrollHistory();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleViewPayroll = async (run) => {
    try {
      setLoadingItems(true);
      const res = await fetch(`/api/hr/payroll/${run.id}`, {
        headers: { "x-org-slug": orgSlug },
      });
      
      if (!res.ok) {
        throw new Error("Error al cargar detalles de la planilla");
      }
      
      const data = await res.json();
      const items = (data.payroll?.items || []).map((item) => ({
        employeeId: item.employee_id,
        employeeName: item.employee_name,
        cedula: item.employee_cedula,
        position: item.employee_position,
        department: item.employee_department,
        salary: Number(item.salary) || 0,
        commissions: Number(item.commissions) || 0,
        totalGross: Number(item.total_gross) || 0,
        inss: Number(item.inss) || 0,
        ir: Number(item.ir) || 0,
        netSalary: Number(item.net_salary) || 0,
        employerINSS: Number(item.employer_inss) || 0,
      }));
      
      setSelectedRun({ ...run, items });
    } catch (err) {
      console.error("Error loading payroll items:", err);
      alert("Error al cargar los detalles de la planilla");
    } finally {
      setLoadingItems(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-NI", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const displayData = selectedRun ? selectedRun.items : currentPayroll;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

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

      {(displayData.length > 0 || selectedRun) && (
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
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">
          {selectedRun ? `Resumen - ${selectedRun.period}` : "Resumen Actual"}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-xl font-bold text-slate-700">{selectedRun ? selectedRun.employeeCount : displayData.length}</p><p className="text-xs text-slate-500">Empleados</p></div>
          <div><p className="text-xl font-bold text-slate-700">{formatCurrency(totals.grossSalary)}</p><p className="text-xs text-slate-500">Total Bruto</p></div>
          <div><p className="text-xl font-bold text-red-600">{formatCurrency(totals.inss + totals.ir)}</p><p className="text-xs text-slate-500">Deducciones</p></div>
          <div><p className="text-xl font-bold text-emerald-600">{formatCurrency(totals.netSalary)}</p><p className="text-xs text-slate-500">Total Neto</p></div>
        </div>
      </div>

      {payrollRuns.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-slate-100 px-4 py-3 border-b">
            <h4 className="text-sm font-semibold text-slate-700">Planillas Guardadas ({payrollRuns.length})</h4>
          </div>
          <div className="divide-y">
            {payrollRuns.map((run) => (
              <div
                key={run.id}
                className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                  selectedRun?.id === run.id ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{run.period}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>{run.employeeCount} empleados</span>
                    <span>Bruto: {formatCurrency(run.totalGross)}</span>
                    <span>Neto: {formatCurrency(run.totalNet)}</span>
                    {run.createdAt && <span>Guardado: {formatDate(run.createdAt)}</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleViewPayroll(run)}
                  disabled={loadingItems}
                  className={`px-4 py-2 text-xs rounded-lg min-h-[36px] ${
                    selectedRun?.id === run.id
                      ? "bg-blue-600 text-white"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  } disabled:opacity-50`}
                >
                  {loadingItems && selectedRun?.id === run.id ? "Cargando..." : "Ver Planilla"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {payrollRuns.length === 0 && !selectedRun && (
        <div className="text-center py-8 text-slate-400 border rounded-lg">
          <p>No hay planillas guardadas</p>
          <p className="text-xs mt-1">Guarda la planilla actual para verla en el historial</p>
        </div>
      )}
    </div>
  );
}