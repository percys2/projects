"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { calculateLiquidation } from "../services/laborConfig";

export default function SettlementsManager({ orgSlug, employees }) {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [settlementType, setSettlementType] = useState("final");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewingSettlement, setViewingSettlement] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    loadSettlements();
  }, [orgSlug]);

  const loadSettlements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hr/settlements", {
        headers: { "x-org-slug": orgSlug },
      });

      if (!res.ok) throw new Error("Error al cargar liquidaciones");

      const data = await res.json();
      setSettlements(data.settlements || []);
    } catch (err) {
      console.error("Settlements fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeEmployees = useMemo(() => {
    return employees?.filter(e => e.status === "activo") || [];
  }, [employees]);

  const liquidationCalc = useMemo(() => {
    if (!selectedEmployee?.salary || !selectedEmployee?.hire_date) return null;
    const totalSalary = (parseFloat(selectedEmployee.salary) || 0) + (parseFloat(selectedEmployee.commissions) || 0);
    return calculateLiquidation(
      totalSalary,
      selectedEmployee.hire_date,
      selectedEmployee.vacation_days_used || 0,
      false
    );
  }, [selectedEmployee]);

  const previousAdvances = useMemo(() => {
    if (!selectedEmployee) return 0;
    return settlements
      .filter(s => s.employee_id === selectedEmployee.id && s.status === "pagado" && s.settlement_type !== "final")
      .reduce((sum, s) => sum + (parseFloat(s.amount_to_pay) || 0), 0);
  }, [selectedEmployee, settlements]);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const openNewSettlement = (employee) => {
    setSelectedEmployee(employee);
    setSettlementType("final");
    setAdvanceAmount("");
    setNotes("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = async () => {
    if (!selectedEmployee || !liquidationCalc) return;

    try {
      setSaving(true);

      const amountToPay = settlementType === "adelanto" 
        ? parseFloat(advanceAmount) || 0
        : liquidationCalc.total - previousAdvances;

      const totalSalary = (parseFloat(selectedEmployee.salary) || 0) + (parseFloat(selectedEmployee.commissions) || 0);
      const settlementData = {
        employee_id: selectedEmployee.id,
        settlement_type: settlementType,
        employee_name: selectedEmployee.name,
        employee_cedula: selectedEmployee.cedula,
        salary: selectedEmployee.salary,
        commissions: selectedEmployee.commissions || 0,
        total_salary: totalSalary,
        hire_date: selectedEmployee.hire_date,
        months_worked: liquidationCalc.monthsWorked,
        years_worked: liquidationCalc.yearsWorked,
        vacation_days_accrued: liquidationCalc.vacationDaysAccrued,
        vacation_days_used: selectedEmployee.vacation_days_used || 0,
        vacation_days_paid: liquidationCalc.vacationDaysAvailable,
        vacation_pay: liquidationCalc.vacationPay,
        aguinaldo_months: liquidationCalc.monthsForAguinaldo,
        aguinaldo_amount: liquidationCalc.proportionalAguinaldo,
        severance_years: liquidationCalc.yearsWorked,
        severance_amount: liquidationCalc.severancePay,
        total_amount: liquidationCalc.total,
        amount_to_pay: amountToPay,
        notes: notes,
        update_employee_status: settlementType === "final",
      };

      const res = await fetch("/api/hr/settlements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(settlementData),
      });

      if (!res.ok) throw new Error("Error al guardar liquidacion");

      await loadSettlements();
      closeModal();
    } catch (err) {
      console.error("Save settlement error:", err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (settlement) => {
    try {
      const res = await fetch("/api/hr/settlements", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          id: settlement.id,
          status: "pagado",
          payment_date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar");

      await loadSettlements();
    } catch (err) {
      console.error("Update error:", err);
      alert(err.message);
    }
  };

  const handlePrint = () => {
    if (!viewingSettlement) return;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Liquidacion - ${viewingSettlement.employee_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .header h1 { margin: 0; font-size: 18px; }
            .section { margin-bottom: 15px; }
            .section-title { font-weight: bold; background: #f0f0f0; padding: 5px; margin-bottom: 5px; }
            .row { display: flex; justify-content: space-between; padding: 3px 5px; border-bottom: 1px dotted #ddd; }
            .row.total { font-weight: bold; border-top: 2px solid #333; border-bottom: none; margin-top: 5px; padding-top: 5px; }
            .signature { margin-top: 50px; display: flex; justify-content: space-between; }
            .signature-line { width: 200px; text-align: center; }
            .signature-line hr { margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Liquidacion de Prestaciones Laborales</h1>
            <p>${viewingSettlement.settlement_type === "adelanto" ? "ADELANTO" : "LIQUIDACION FINAL"}</p>
          </div>
          
          <div class="section">
            <div class="section-title">Datos del Empleado</div>
            <div class="row"><span>Nombre:</span><span>${viewingSettlement.employee_name}</span></div>
            <div class="row"><span>Cedula:</span><span>${viewingSettlement.employee_cedula || "N/A"}</span></div>
            <div class="row"><span>Fecha de Ingreso:</span><span>${new Date(viewingSettlement.hire_date).toLocaleDateString("es-NI")}</span></div>
            <div class="row"><span>Fecha de Liquidacion:</span><span>${new Date(viewingSettlement.settlement_date).toLocaleDateString("es-NI")}</span></div>
            <div class="row"><span>Tiempo Laborado:</span><span>${viewingSettlement.years_worked} anos, ${viewingSettlement.months_worked % 12} meses</span></div>
          </div>

          <div class="section">
            <div class="section-title">Desglose de Prestaciones</div>
            <div class="row"><span>Salario Base:</span><span>${formatCurrency(viewingSettlement.salary_at_settlement)}</span></div>
            <div class="row"><span>Vacaciones (${viewingSettlement.vacation_days_paid} dias):</span><span>${formatCurrency(viewingSettlement.vacation_pay)}</span></div>
            <div class="row"><span>Aguinaldo Proporcional (${viewingSettlement.aguinaldo_months} meses):</span><span>${formatCurrency(viewingSettlement.aguinaldo_amount)}</span></div>
            <div class="row"><span>Indemnizacion (${viewingSettlement.severance_years} anos):</span><span>${formatCurrency(viewingSettlement.severance_amount)}</span></div>
            <div class="row total"><span>TOTAL LIQUIDACION:</span><span>${formatCurrency(viewingSettlement.total_amount)}</span></div>
            ${viewingSettlement.previous_advances > 0 ? `<div class="row"><span>Adelantos Previos:</span><span>-${formatCurrency(viewingSettlement.previous_advances)}</span></div>` : ""}
            <div class="row total"><span>MONTO A PAGAR:</span><span>${formatCurrency(viewingSettlement.amount_to_pay)}</span></div>
          </div>

          ${viewingSettlement.notes ? `<div class="section"><div class="section-title">Notas</div><p>${viewingSettlement.notes}</p></div>` : ""}

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

  const getStatusBadge = (status) => {
    const styles = {
      pendiente: "bg-yellow-100 text-yellow-800",
      pagado: "bg-green-100 text-green-800",
      anulado: "bg-red-100 text-red-800",
    };
    const labels = {
      pendiente: "Pendiente",
      pagado: "Pagado",
      anulado: "Anulado",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${styles[status] || "bg-gray-100"}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      adelanto: "bg-blue-100 text-blue-800",
      final: "bg-purple-100 text-purple-800",
      parcial: "bg-orange-100 text-orange-800",
    };
    const labels = {
      adelanto: "Adelanto",
      final: "Final",
      parcial: "Parcial",
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs ${styles[type] || "bg-gray-100"}`}>
        {labels[type] || type}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-slate-500">Cargando liquidaciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Nueva Liquidacion / Adelanto</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Seleccionar Empleado</label>
            <select
              onChange={(e) => {
                const emp = activeEmployees.find(emp => emp.id === e.target.value);
                if (emp) openNewSettlement(emp);
              }}
              value=""
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="">-- Seleccionar empleado --</option>
              {activeEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h4 className="font-semibold text-slate-800">Historial de Liquidaciones</h4>
        </div>

        {settlements.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No hay liquidaciones registradas
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Empleado</th>
                  <th className="px-3 py-2 text-center">Tipo</th>
                  <th className="px-3 py-2 text-right">Total</th>
                  <th className="px-3 py-2 text-right">A Pagar</th>
                  <th className="px-3 py-2 text-center">Estado</th>
                  <th className="px-3 py-2 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {settlements.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-2">{new Date(s.settlement_date).toLocaleDateString("es-NI")}</td>
                    <td className="px-3 py-2">{s.employee_name}</td>
                    <td className="px-3 py-2 text-center">{getTypeBadge(s.settlement_type)}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(s.total_amount)}</td>
                    <td className="px-3 py-2 text-right font-medium">{formatCurrency(s.amount_to_pay)}</td>
                    <td className="px-3 py-2 text-center">{getStatusBadge(s.status)}</td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => setViewingSettlement(s)}
                          className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                        >
                          Ver
                        </button>
                        {s.status === "pendiente" && (
                          <button
                            onClick={() => markAsPaid(s)}
                            className="px-2 py-1 text-xs text-green-600 hover:text-green-800"
                          >
                            Marcar Pagado
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {settlementType === "adelanto" ? "Adelanto de Liquidacion" : "Liquidacion Final"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold mb-2">Empleado: {selectedEmployee.name}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-slate-500">Cedula:</span> {selectedEmployee.cedula}</div>
                  <div><span className="text-slate-500">Cargo:</span> {selectedEmployee.position}</div>
                  <div><span className="text-slate-500">Salario:</span> {formatCurrency(selectedEmployee.salary)}</div>
                  <div><span className="text-slate-500">Fecha Ingreso:</span> {new Date(selectedEmployee.hire_date).toLocaleDateString("es-NI")}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Liquidacion</label>
                <select
                  value={settlementType}
                  onChange={(e) => setSettlementType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="final">Liquidacion Final</option>
                  <option value="adelanto">Adelanto</option>
                </select>
              </div>

              {liquidationCalc && (
                <div className="bg-white border rounded-lg p-4">
                  <h4 className="text-sm font-semibold mb-3">Calculo de Prestaciones</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Tiempo laborado:</span>
                      <span>{liquidationCalc.yearsWorked} anos, {liquidationCalc.monthsWorked % 12} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Vacaciones ({liquidationCalc.vacationDaysAvailable} dias):</span>
                      <span>{formatCurrency(liquidationCalc.vacationPay)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Aguinaldo proporcional ({liquidationCalc.monthsForAguinaldo} meses):</span>
                      <span>{formatCurrency(liquidationCalc.proportionalAguinaldo)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Indemnizacion ({Math.min(liquidationCalc.yearsWorked, 5)} anos):</span>
                      <span>{formatCurrency(liquidationCalc.severancePay)}</span>
                    </div>
                    {liquidationCalc.severanceTax > 0 && (
                      <div className="flex justify-between text-red-600 text-xs">
                        <span>IR sobre indemnizacion (15% excedente C$500,000):</span>
                        <span>- {formatCurrency(liquidationCalc.severanceTax)}</span>
                      </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Liquidacion:</span>
                      <span>{formatCurrency(liquidationCalc.total)}</span>
                    </div>
                    {previousAdvances > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Adelantos previos:</span>
                        <span>- {formatCurrency(previousAdvances)}</span>
                      </div>
                    )}
                    {settlementType === "final" && (
                      <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                        <span>Monto a Pagar:</span>
                        <span>{formatCurrency(liquidationCalc.total - previousAdvances)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {settlementType === "adelanto" && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Monto del Adelanto (C$)</label>
                  <input
                    type="number"
                    value={advanceAmount}
                    onChange={(e) => setAdvanceAmount(e.target.value)}
                    placeholder="0.00"
                    max={liquidationCalc?.total - previousAdvances}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Maximo disponible: {formatCurrency((liquidationCalc?.total || 0) - previousAdvances)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Notas adicionales..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (settlementType === "adelanto" && !advanceAmount)}
                  className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewingSettlement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Detalle de Liquidacion</h2>
              <button onClick={() => setViewingSettlement(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>

            <div ref={printRef} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{viewingSettlement.employee_name}</h3>
                  <p className="text-sm text-slate-500">{viewingSettlement.employee_cedula}</p>
                </div>
                <div className="text-right">
                  {getTypeBadge(viewingSettlement.settlement_type)}
                  <span className="mx-1"></span>
                  {getStatusBadge(viewingSettlement.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm bg-slate-50 rounded-lg p-3">
                <div><span className="text-slate-500">Fecha:</span> {new Date(viewingSettlement.settlement_date).toLocaleDateString("es-NI")}</div>
                <div><span className="text-slate-500">Salario:</span> {formatCurrency(viewingSettlement.salary_at_settlement)}</div>
                <div><span className="text-slate-500">Tiempo:</span> {viewingSettlement.years_worked}a {viewingSettlement.months_worked % 12}m</div>
                <div><span className="text-slate-500">Ingreso:</span> {new Date(viewingSettlement.hire_date).toLocaleDateString("es-NI")}</div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vacaciones ({viewingSettlement.vacation_days_paid} dias):</span>
                  <span>{formatCurrency(viewingSettlement.vacation_pay)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Aguinaldo ({viewingSettlement.aguinaldo_months} meses):</span>
                  <span>{formatCurrency(viewingSettlement.aguinaldo_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Indemnizacion ({viewingSettlement.severance_years} anos):</span>
                  <span>{formatCurrency(viewingSettlement.severance_amount)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>{formatCurrency(viewingSettlement.total_amount)}</span>
                </div>
                {viewingSettlement.previous_advances > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Adelantos previos:</span>
                    <span>- {formatCurrency(viewingSettlement.previous_advances)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>A Pagar:</span>
                  <span className="text-green-600">{formatCurrency(viewingSettlement.amount_to_pay)}</span>
                </div>
              </div>

              {viewingSettlement.notes && (
                <div className="bg-slate-50 rounded-lg p-3 text-sm">
                  <span className="text-slate-500">Notas:</span> {viewingSettlement.notes}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-slate-50"
              >
                Imprimir
              </button>
              <button
                onClick={() => setViewingSettlement(null)}
                className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}