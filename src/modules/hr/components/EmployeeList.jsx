"use client";

import React from "react";

export default function EmployeeList({
  employees,
  onEdit,
  onDelete,
  onViewPayroll,
  calculateVacation,
  calculateAguinaldo,
}) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay empleados registrados
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-NI");
  };

  const getStatusBadge = (status) => {
    const styles = {
      activo: "bg-emerald-100 text-emerald-700",
      inactivo: "bg-slate-100 text-slate-700",
      vacaciones: "bg-blue-100 text-blue-700",
      licencia: "bg-amber-100 text-amber-700",
    };
    return styles[status] || styles.inactivo;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2 text-left">Empleado</th>
            <th className="px-3 py-2 text-left">Cédula</th>
            <th className="px-3 py-2 text-left">Cargo</th>
            <th className="px-3 py-2 text-left">Departamento</th>
            <th className="px-3 py-2 text-right">Salario</th>
            <th className="px-3 py-2 text-left">Fecha Ingreso</th>
            <th className="px-3 py-2 text-center">Vacaciones</th>
            <th className="px-3 py-2 text-center">Estado</th>
            <th className="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const vacation = calculateVacation(emp);
            const aguinaldo = calculateAguinaldo(emp);

            return (
              <tr key={emp.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-800">{emp.name}</p>
                    <p className="text-xs text-slate-400">{emp.email}</p>
                  </div>
                </td>
                <td className="px-3 py-2 text-slate-600">{emp.cedula || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{emp.position || "—"}</td>
                <td className="px-3 py-2 text-slate-600">{emp.department || "—"}</td>
                <td className="px-3 py-2 text-right font-medium">
                  C$ {(emp.salary || 0).toLocaleString("es-NI")}
                </td>
                <td className="px-3 py-2 text-slate-600">
                  {formatDate(emp.hire_date)}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="text-xs">
                    {vacation.available} días
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(
                      emp.status
                    )}`}
                  >
                    {emp.status || "activo"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onViewPayroll(emp)}
                      className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                    >
                      Nómina
                    </button>
                    <button
                      onClick={() => onEdit(emp)}
                      className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("¿Eliminar este empleado?")) {
                          onDelete(emp.id);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}