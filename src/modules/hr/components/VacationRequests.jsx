"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { calculateVacationDays } from "../services/laborConfig";

export default function VacationRequests({ employees, orgSlug }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [requestForm, setRequestForm] = useState({
    startDate: "",
    endDate: "",
    type: "vacaciones",
    notes: "",
  });

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo");
  }, [employees]);

  const loadRequests = useCallback(async () => {
    if (!orgSlug) return;
    try {
      setLoading(true);
      const res = await fetch("/api/hr/vacations", {
        headers: { "x-org-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Error loading vacation requests:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const getEmployeeVacationDays = (employee) => {
    if (!employee?.hire_date) return 0;
    const hireDate = new Date(employee.hire_date);
    const now = new Date();
    const monthsWorked = Math.floor((now - hireDate) / (1000 * 60 * 60 * 24 * 30));
    return calculateVacationDays(monthsWorked);
  };

  const getUsedVacationDays = (employeeId) => {
    return requests
      .filter((r) => r.employee_id === employeeId && r.status === "aprobado" && r.type === "vacaciones")
      .reduce((sum, r) => sum + (r.days || 0), 0);
  };

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleSubmitRequest = async () => {
    if (!selectedEmployee || !requestForm.startDate || !requestForm.endDate) {
      alert("Complete todos los campos requeridos");
      return;
    }

    try {
      setSaving(true);
      const days = calculateDays(requestForm.startDate, requestForm.endDate);
      const res = await fetch("/api/hr/vacations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          startDate: requestForm.startDate,
          endDate: requestForm.endDate,
          days,
          type: requestForm.type,
          notes: requestForm.notes,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al crear solicitud");
      }

      const { request } = await res.json();
      setRequests((prev) => [request, ...prev]);
      setShowModal(false);
      setRequestForm({ startDate: "", endDate: "", type: "vacaciones", notes: "" });
      setSelectedEmployee("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const res = await fetch("/api/hr/vacations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id: requestId, status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al actualizar solicitud");
      }

      const { request } = await res.json();
      setRequests((prev) => prev.map((r) => (r.id === requestId ? request : r)));
    } catch (err) {
      alert(err.message);
    }
  };

  const statusColors = {
    pendiente: "bg-amber-100 text-amber-700",
    aprobado: "bg-emerald-100 text-emerald-700",
    rechazado: "bg-red-100 text-red-700",
  };

  const typeLabels = {
    vacaciones: "Vacaciones",
    permiso: "Permiso",
    enfermedad: "Enfermedad",
    maternidad: "Maternidad/Paternidad",
    otro: "Otro",
  };

  const pendingRequests = requests.filter((r) => r.status === "pendiente");
  const approvedRequests = requests.filter((r) => r.status === "aprobado");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Solicitudes de Vacaciones y Permisos</h3>
          <p className="text-xs text-slate-500">Gestiona solicitudes de ausencia de empleados</p>
        </div>
        <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">+ Nueva Solicitud</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{pendingRequests.length}</p>
          <p className="text-xs text-slate-500">Pendientes de Aprobar</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-emerald-600">{approvedRequests.length}</p>
          <p className="text-xs text-slate-500">Aprobadas</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{approvedRequests.reduce((sum, r) => sum + (r.days || 0), 0)}</p>
          <p className="text-xs text-slate-500">Dias Aprobados Total</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-amber-50">
            <h4 className="text-sm font-semibold text-amber-700">Solicitudes Pendientes ({pendingRequests.length})</h4>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {pendingRequests.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No hay solicitudes pendientes</p>
            ) : (
              pendingRequests.map((request) => (
                <div key={request.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-slate-800">{request.employee?.name || "Empleado"}</p>
                      <p className="text-xs text-slate-500">{typeLabels[request.type]}</p>
                    </div>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">{request.days} dias</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-2">
                    {new Date(request.start_date).toLocaleDateString("es-NI")} - {new Date(request.end_date).toLocaleDateString("es-NI")}
                  </p>
                  {request.notes && <p className="text-xs text-slate-400 mb-2">{request.notes}</p>}
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateStatus(request.id, "aprobado")} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Aprobar</button>
                    <button onClick={() => handleUpdateStatus(request.id, "rechazado")} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Rechazar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-700">Historial de Solicitudes</h4>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {requests.filter((r) => r.status !== "pendiente").length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">No hay historial</p>
            ) : (
              requests.filter((r) => r.status !== "pendiente").map((request) => (
                <div key={request.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800">{request.employee?.name || "Empleado"}</p>
                    <p className="text-xs text-slate-500">{typeLabels[request.type]} - {request.days} dias</p>
                    <p className="text-xs text-slate-400">
                      {new Date(request.start_date).toLocaleDateString("es-NI")} - {new Date(request.end_date).toLocaleDateString("es-NI")}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[request.status]}`}>
                    {request.status === "aprobado" ? "Aprobado" : "Rechazado"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <div className="px-4 py-3 border-b bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-700">Balance de Vacaciones por Empleado</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-600">
                <th className="px-3 py-2 text-left">Empleado</th>
                <th className="px-3 py-2 text-right">Dias Acumulados</th>
                <th className="px-3 py-2 text-right">Dias Usados</th>
                <th className="px-3 py-2 text-right">Dias Disponibles</th>
              </tr>
            </thead>
            <tbody>
              {activeEmployees.map((emp) => {
                const accrued = getEmployeeVacationDays(emp);
                const used = getUsedVacationDays(emp.id);
                const available = Math.max(0, accrued - used);
                return (
                  <tr key={emp.id} className="border-b hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <p className="font-medium text-slate-800">{emp.name}</p>
                      <p className="text-xs text-slate-400">{emp.position}</p>
                    </td>
                    <td className="px-3 py-2 text-right">{accrued.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right text-red-600">{used}</td>
                    <td className="px-3 py-2 text-right font-semibold text-emerald-600">{available.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Nueva Solicitud</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Seleccionar empleado</option>
                  {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Tipo de Solicitud *</label>
                <select value={requestForm.type} onChange={(e) => setRequestForm({ ...requestForm, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="vacaciones">Vacaciones</option>
                  <option value="permiso">Permiso</option>
                  <option value="enfermedad">Enfermedad</option>
                  <option value="maternidad">Maternidad/Paternidad</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Inicio *</label>
                  <input type="date" value={requestForm.startDate} onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Fin *</label>
                  <input type="date" value={requestForm.endDate} onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
                </div>
              </div>
              {requestForm.startDate && requestForm.endDate && (
                <p className="text-sm text-blue-600">Total: {calculateDays(requestForm.startDate, requestForm.endDate)} dias</p>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <textarea value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Motivo o comentarios..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowModal(false); setSelectedEmployee(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800" disabled={saving}>Cancelar</button>
              <button onClick={handleSubmitRequest} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50" disabled={saving}>{saving ? "Guardando..." : "Enviar Solicitud"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}