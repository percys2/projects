import React from "react";

export default function EmployeesList({ employees, onEdit, onDelete }) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay empleados registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-xs text-slate-600">
            <th className="pb-2 font-medium">Nombre</th>
            <th className="pb-2 font-medium">Puesto</th>
            <th className="pb-2 font-medium">Departamento</th>
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Teléfono</th>
            <th className="pb-2 font-medium text-right">Salario</th>
            <th className="pb-2 font-medium">Estado</th>
            <th className="pb-2 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} className="border-b hover:bg-slate-50">
              <td className="py-3 text-sm font-medium">{employee.full_name}</td>
              <td className="py-3 text-sm">{employee.position}</td>
              <td className="py-3 text-sm">{employee.department}</td>
              <td className="py-3 text-sm">{employee.email}</td>
              <td className="py-3 text-sm">{employee.phone}</td>
              <td className="py-3 text-sm text-right">
                C$ {(employee.salary || 0).toFixed(2)}
              </td>
              <td className="py-3 text-sm">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {employee.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="py-3 text-sm text-right">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-blue-600 hover:text-blue-800 mr-3 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(employee.id)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
