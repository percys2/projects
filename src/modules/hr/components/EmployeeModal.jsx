import React, { useState, useEffect } from "react";

export default function EmployeeModal({ isOpen, onClose, onSave, employee }) {
  const [formData, setFormData] = useState({
    full_name: "",
    position: "",
    department: "",
    email: "",
    phone: "",
    salary: 0,
    hire_date: new Date().toISOString().split("T")[0],
    status: "active",
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        full_name: employee.full_name || "",
        position: employee.position || "",
        department: employee.department || "",
        email: employee.email || "",
        phone: employee.phone || "",
        salary: employee.salary || 0,
        hire_date: employee.hire_date || new Date().toISOString().split("T")[0],
        status: employee.status || "active",
      });
    } else {
      setFormData({
        full_name: "",
        position: "",
        department: "",
        email: "",
        phone: "",
        salary: 0,
        hire_date: new Date().toISOString().split("T")[0],
        status: "active",
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {employee ? "Editar Empleado" : "Nuevo Empleado"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo</label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Juan Pérez"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Puesto</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Gerente de Ventas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Departamento</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => handleChange("department", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ventas"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="juan@ejemplo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="8888-8888"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Salario (C$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => handleChange("salary", parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Fecha de Contratación</label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => handleChange("hire_date", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
