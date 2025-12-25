"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";

export default function LoansDeductions({ employees, orgSlug }) {
  const [loans, setLoans] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [saving, setSaving] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: "",
    monthlyPayment: "",
    description: "",
    startDate: new Date().toISOString().split("T")[0],
  });
  const [deductionForm, setDeductionForm] = useState({
    amount: "",
    type: "pension_alimenticia",
    description: "",
    isActive: true,
  });

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo");
  }, [employees]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const loadData = useCallback(async () => {
    if (!orgSlug) return;
    try {
      setLoading(true);
      const [loansRes, deductionsRes] = await Promise.all([
        fetch("/api/hr/loans", { headers: { "x-org-slug": orgSlug } }),
        fetch("/api/hr/deductions", { headers: { "x-org-slug": orgSlug } }),
      ]);

      if (loansRes.ok) {
        const loansData = await loansRes.json();
        setLoans(loansData.loans || []);
      }
      if (deductionsRes.ok) {
        const deductionsData = await deductionsRes.json();
        setDeductions(deductionsData.deductions || []);
      }
    } catch (err) {
      console.error("Error loading loans/deductions:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddLoan = async () => {
    if (!selectedEmployee || !loanForm.amount || !loanForm.monthlyPayment) {
      alert("Complete todos los campos requeridos");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/hr/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          totalAmount: loanForm.amount,
          monthlyPayment: loanForm.monthlyPayment,
          description: loanForm.description,
          startDate: loanForm.startDate,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear prestamo");
      }

      const { loan } = await res.json();
      setLoans((prev) => [loan, ...prev]);
      setShowLoanModal(false);
      setLoanForm({ amount: "", monthlyPayment: "", description: "", startDate: new Date().toISOString().split("T")[0] });
      setSelectedEmployee("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddDeduction = async () => {
    if (!selectedEmployee || !deductionForm.amount) {
      alert("Complete todos los campos requeridos");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/hr/deductions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          amount: deductionForm.amount,
          type: deductionForm.type,
          description: deductionForm.description,
          isActive: deductionForm.isActive,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear deduccion");
      }

      const { deduction } = await res.json();
      setDeductions((prev) => [deduction, ...prev]);
      setShowDeductionModal(false);
      setDeductionForm({ amount: "", type: "pension_alimenticia", description: "", isActive: true });
      setSelectedEmployee("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePayLoan = async (loanId) => {
    try {
      const res = await fetch("/api/hr/loans", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id: loanId, action: "payment" }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al registrar pago");
      }

      const { loan } = await res.json();
      setLoans((prev) => prev.map((l) => (l.id === loanId ? loan : l)));
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleDeduction = async (deductionId) => {
    const deduction = deductions.find((d) => d.id === deductionId);
    if (!deduction) return;

    try {
      const res = await fetch("/api/hr/deductions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id: deductionId, isActive: !deduction.is_active }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar deduccion");
      }

      const { deduction: updated } = await res.json();
      setDeductions((prev) => prev.map((d) => (d.id === deductionId ? updated : d)));
    } catch (err) {
      alert(err.message);
    }
  };

  const deductionTypes = {
    pension_alimenticia: "Pension Alimenticia",
    seguro: "Seguro",
    cooperativa: "Cooperativa",
    otro: "Otro",
  };

  const activeLoans = loans.filter((l) => l.status === "activo");
  const activeDeductionsList = deductions.filter((d) => d.is_active);
  const totalMonthlyLoans = activeLoans.reduce((sum, l) => sum + Math.min(Number(l.monthly_payment), Number(l.remaining_amount)), 0);
  const totalMonthlyDeductions = activeDeductionsList.reduce((sum, d) => sum + Number(d.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Prestamos y Deducciones</h3>
          <p className="text-xs text-slate-500">Gestiona prestamos a empleados y deducciones recurrentes</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowLoanModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">+ Nuevo Prestamo</button>
          <button onClick={() => setShowDeductionModal(true)} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700">+ Nueva Deduccion</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-700 mb-1">Prestamos Activos</h4>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyLoans)}</p>
          <p className="text-xs text-slate-500">Deduccion mensual total</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-700 mb-1">Deducciones Fijas</h4>
          <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalMonthlyDeductions)}</p>
          <p className="text-xs text-slate-500">Deduccion mensual total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-700">Prestamos ({loans.length})</h4>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {loans.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No hay prestamos registrados</p>
            ) : (
              loans.map((loan) => (
                <div key={loan.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-800">{loan.employee?.name || "Empleado"}</p>
                      <p className="text-xs text-slate-500">{loan.description || "Prestamo"}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${loan.status === "activo" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {loan.status === "activo" ? "Activo" : "Pagado"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                    <div><p className="text-slate-500">Total</p><p className="font-medium">{formatCurrency(loan.total_amount)}</p></div>
                    <div><p className="text-slate-500">Pagado</p><p className="font-medium text-emerald-600">{formatCurrency(loan.paid_amount)}</p></div>
                    <div><p className="text-slate-500">Pendiente</p><p className="font-medium text-red-600">{formatCurrency(loan.remaining_amount)}</p></div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(Number(loan.paid_amount) / Number(loan.total_amount)) * 100}%` }} />
                  </div>
                  {loan.status === "activo" && (
                    <button onClick={() => handlePayLoan(loan.id)} className="text-xs text-blue-600 hover:text-blue-800">
                      Registrar pago de {formatCurrency(Math.min(Number(loan.monthly_payment), Number(loan.remaining_amount)))}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-700">Deducciones Recurrentes ({deductions.length})</h4>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {deductions.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No hay deducciones registradas</p>
            ) : (
              deductions.map((deduction) => (
                <div key={deduction.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{deduction.employee?.name || "Empleado"}</p>
                    <p className="text-xs text-slate-500">{deductionTypes[deduction.type] || deduction.type}</p>
                    {deduction.description && <p className="text-xs text-slate-400">{deduction.description}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-purple-600">{formatCurrency(deduction.amount)}</p>
                    <button onClick={() => toggleDeduction(deduction.id)} className={`text-xs ${deduction.is_active ? "text-red-600" : "text-emerald-600"}`}>
                      {deduction.is_active ? "Desactivar" : "Activar"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showLoanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Nuevo Prestamo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Seleccionar empleado</option>
                  {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monto Total (C$) *</label>
                <input type="number" value={loanForm.amount} onChange={(e) => setLoanForm({ ...loanForm, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Pago Mensual (C$) *</label>
                <input type="number" value={loanForm.monthlyPayment} onChange={(e) => setLoanForm({ ...loanForm, monthlyPayment: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripcion</label>
                <input type="text" value={loanForm.description} onChange={(e) => setLoanForm({ ...loanForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Adelanto de salario" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowLoanModal(false); setSelectedEmployee(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800" disabled={saving}>Cancelar</button>
              <button onClick={handleAddLoan} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}

      {showDeductionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Deduccion Recurrente</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Seleccionar empleado</option>
                  {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Deduccion *</label>
                <select value={deductionForm.type} onChange={(e) => setDeductionForm({ ...deductionForm, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="pension_alimenticia">Pension Alimenticia</option>
                  <option value="seguro">Seguro</option>
                  <option value="cooperativa">Cooperativa</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Monto Mensual (C$) *</label>
                <input type="number" value={deductionForm.amount} onChange={(e) => setDeductionForm({ ...deductionForm, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripcion</label>
                <input type="text" value={deductionForm.description} onChange={(e) => setDeductionForm({ ...deductionForm, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Ej: Juzgado de Managua" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowDeductionModal(false); setSelectedEmployee(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800" disabled={saving}>Cancelar</button>
              <button onClick={handleAddDeduction} className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
