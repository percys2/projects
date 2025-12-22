"use client";

import React, { useState, useMemo } from "react";

export default function AttendanceTracker({ employees, orgSlug }) {
  const [attendance, setAttendance] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    status: "presente",
    hoursWorked: "8",
    overtimeHours: "0",
    notes: "",
  });

  const activeEmployees = useMemo(() => {
    return employees.filter((emp) => emp.status === "activo");
  }, [employees]);

  const monthAttendance = useMemo(() => {
    return attendance.filter((a) => a.date.startsWith(selectedMonth));
  }, [attendance, selectedMonth]);

  const employeeStats = useMemo(() => {
    const stats = {};
    activeEmployees.forEach((emp) => {
      const empAttendance = monthAttendance.filter((a) => a.employeeId === emp.id);
      stats[emp.id] = {
        present: empAttendance.filter((a) => a.status === "presente").length,
        absent: empAttendance.filter((a) => a.status === "ausente").length,
        late: empAttendance.filter((a) => a.status === "tardanza").length,
        vacation: empAttendance.filter((a) => a.status === "vacaciones").length,
        sick: empAttendance.filter((a) => a.status === "enfermedad").length,
        totalHours: empAttendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
        overtimeHours: empAttendance.reduce((sum, a) => sum + (a.overtimeHours || 0), 0),
      };
    });
    return stats;
  }, [activeEmployees, monthAttendance]);

  const handleAddAttendance = () => {
    if (!selectedEmployee || !attendanceForm.date) {
      alert("Seleccione empleado y fecha");
      return;
    }
    const employee = activeEmployees.find((e) => e.id === selectedEmployee);
    const newAttendance = {
      id: Date.now().toString(),
      employeeId: selectedEmployee,
      employeeName: employee?.name || "",
      date: attendanceForm.date,
      status: attendanceForm.status,
      hoursWorked: parseFloat(attendanceForm.hoursWorked) || 0,
      overtimeHours: parseFloat(attendanceForm.overtimeHours) || 0,
      notes: attendanceForm.notes,
    };
    setAttendance((prev) => [...prev, newAttendance]);
    setShowModal(false);
    setAttendanceForm({ date: new Date().toISOString().split("T")[0], status: "presente", hoursWorked: "8", overtimeHours: "0", notes: "" });
    setSelectedEmployee("");
  };

  const statusColors = {
    presente: "bg-emerald-100 text-emerald-700",
    ausente: "bg-red-100 text-red-700",
    tardanza: "bg-amber-100 text-amber-700",
    vacaciones: "bg-blue-100 text-blue-700",
    enfermedad: "bg-purple-100 text-purple-700",
  };

  const statusLabels = {
    presente: "Presente",
    ausente: "Ausente",
    tardanza: "Tardanza",
    vacaciones: "Vacaciones",
    enfermedad: "Enfermedad",
  };

  const totalStats = useMemo(() => {
    return Object.values(employeeStats).reduce(
      (acc, stats) => ({
        present: acc.present + stats.present,
        absent: acc.absent + stats.absent,
        late: acc.late + stats.late,
        totalHours: acc.totalHours + stats.totalHours,
        overtimeHours: acc.overtimeHours + stats.overtimeHours,
      }),
      { present: 0, absent: 0, late: 0, totalHours: 0, overtimeHours: 0 }
    );
  }, [employeeStats]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Control de Asistencia</h3>
          <p className="text-xs text-slate-500">Registro de asistencia y horas trabajadas</p>
        </div>
        <div className="flex gap-2">
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
          <button onClick={() => setShowModal(true)} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800">+ Registrar Asistencia</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{totalStats.present}</p>
          <p className="text-xs text-slate-500">Presentes</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{totalStats.absent}</p>
          <p className="text-xs text-slate-500">Ausencias</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-600">{totalStats.late}</p>
          <p className="text-xs text-slate-500">Tardanzas</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalStats.totalHours}</p>
          <p className="text-xs text-slate-500">Horas Trabajadas</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalStats.overtimeHours}</p>
          <p className="text-xs text-slate-500">Horas Extra</p>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b text-xs uppercase tracking-wide text-slate-600">
              <th className="px-3 py-2 text-left">Empleado</th>
              <th className="px-3 py-2 text-center">Presentes</th>
              <th className="px-3 py-2 text-center">Ausencias</th>
              <th className="px-3 py-2 text-center">Tardanzas</th>
              <th className="px-3 py-2 text-center">Vacaciones</th>
              <th className="px-3 py-2 text-center">Enfermedad</th>
              <th className="px-3 py-2 text-right">Horas</th>
              <th className="px-3 py-2 text-right">H. Extra</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((emp) => {
              const stats = employeeStats[emp.id] || {};
              return (
                <tr key={emp.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2">
                    <p className="font-medium text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.position}</p>
                  </td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs">{stats.present || 0}</span></td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">{stats.absent || 0}</span></td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">{stats.late || 0}</span></td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">{stats.vacation || 0}</span></td>
                  <td className="px-3 py-2 text-center"><span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">{stats.sick || 0}</span></td>
                  <td className="px-3 py-2 text-right font-medium">{stats.totalHours || 0}h</td>
                  <td className="px-3 py-2 text-right text-purple-600">{stats.overtimeHours || 0}h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {monthAttendance.length > 0 && (
        <div className="border rounded-lg">
          <div className="px-4 py-3 border-b bg-slate-50">
            <h4 className="text-sm font-semibold text-slate-700">Registros del Mes</h4>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {monthAttendance.slice(0, 20).map((record) => (
              <div key={record.id} className="p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-slate-800">{record.employeeName}</p>
                  <p className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString("es-NI")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${statusColors[record.status]}`}>{statusLabels[record.status]}</span>
                  <span className="text-xs text-slate-500">{record.hoursWorked}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Registrar Asistencia</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Empleado *</label>
                <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="">Seleccionar empleado</option>
                  {activeEmployees.map((emp) => (<option key={emp.id} value={emp.id}>{emp.name}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha *</label>
                <input type="date" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Estado *</label>
                <select value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="presente">Presente</option>
                  <option value="ausente">Ausente</option>
                  <option value="tardanza">Tardanza</option>
                  <option value="vacaciones">Vacaciones</option>
                  <option value="enfermedad">Enfermedad</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Horas Trabajadas</label>
                  <input type="number" value={attendanceForm.hoursWorked} onChange={(e) => setAttendanceForm({ ...attendanceForm, hoursWorked: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" min="0" max="24" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Horas Extra</label>
                  <input type="number" value={attendanceForm.overtimeHours} onChange={(e) => setAttendanceForm({ ...attendanceForm, overtimeHours: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" min="0" max="12" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <input type="text" value={attendanceForm.notes} onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setShowModal(false); setSelectedEmployee(""); }} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
              <button onClick={handleAddAttendance} className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}