import React, { useState } from "react";
import { formatDate } from "@/src/lib/utils/formatDate";

export default function AttendanceTracker({ employees, attendance, onMarkAttendance }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleMarkAttendance = async (employeeId, status) => {
    await onMarkAttendance({
      employee_id: employeeId,
      date: selectedDate,
      status,
    });
  };

  const getAttendanceForDate = (employeeId) => {
    return attendance.find(
      (a) => a.employee_id === employeeId && a.date === selectedDate
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Fecha:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No hay empleados para registrar asistencia</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-slate-600">
                <th className="pb-2 font-medium">Empleado</th>
                <th className="pb-2 font-medium">Puesto</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => {
                const attendanceRecord = getAttendanceForDate(employee.id);
                return (
                  <tr key={employee.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 text-sm font-medium">
                      {employee.full_name}
                    </td>
                    <td className="py-3 text-sm">{employee.position}</td>
                    <td className="py-3 text-sm">
                      {attendanceRecord ? (
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            attendanceRecord.status === "present"
                              ? "bg-green-100 text-green-700"
                              : attendanceRecord.status === "absent"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {attendanceRecord.status === "present"
                            ? "Presente"
                            : attendanceRecord.status === "absent"
                            ? "Ausente"
                            : "Permiso"}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          Sin registrar
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-sm text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleMarkAttendance(employee.id, "present")}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                        >
                          Presente
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(employee.id, "absent")}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                        >
                          Ausente
                        </button>
                        <button
                          onClick={() => handleMarkAttendance(employee.id, "leave")}
                          className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs hover:bg-yellow-200"
                        >
                          Permiso
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
