"use client";

import React, { useState, useEffect } from "react";

export default function EmployeeFormModal({
  isOpen,
  onClose,
  onSave,
  employee,
  departments,
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    cedula: "",
    inss_number: "",
    position: "",
    department: "",
    salary: "",
    hire_date: "",
    contract_type: "indefinido",
    status: "activo",
    address: "",
    emergency_contact: "",
    emergency_phone: "",
    bank_account: "",
    bank_name: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee) {
      setForm({
        ...employee,
        salary: employee.salary?.toString() || "",
        hire_date: employee.hire_date?.split("T")[0] || "",
      });
    } else {
      setForm({
        name: "",
        email: "",
        phone: "",
        cedula: "",
        inss_number: "",
        position: "",
        department: "",
        salary: "",
        hire_date: "",
        contract_type: "indefinido",
        status: "activo",
        address: "",
        emergency_contact: "",
        emergency_phone: "",
        bank_account: "",
        bank_name: "",
      });
    }
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const data = {
      ...form,
      salary: parseFloat(form.salary) || 0,
    };

    if (employee?.id) {
      data.id = employee.id;
    }

    const result = await onSave(data);
    setSaving(false);

    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {employee ? "Editar Empleado" : "Nuevo Empleado"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cédula *
              </label>
              <input
                type="text"
                name="cedula"
                value={form.cedula}
                onChange={handleChange}
                required
                placeholder="000-000000-0000X"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Número INSS
              </label>
              <input
                type="text"
                name="inss_number"
                value={form.inss_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cargo *
              </label>
              <input
                type="text"
                name="position"
                value={form.position}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Departamento
              </label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                list="departments-list"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <datalist id="departments-list">
                {departments?.map((dept) => (
                  <option key={dept} value={dept} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Salario Mensual (C$) *
              </label>
              <input
                type="number"
                name="salary"
                value={form.salary}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha de Ingreso *
              </label>
              <input
                type="date"
                name="hire_date"
                value={form.hire_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tipo de Contrato
              </label>
              <select
                name="contract_type"
                value={form.contract_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="indefinido">Indefinido</option>
                <option value="plazo_fijo">Plazo Fijo</option>
                <option value="por_obra">Por Obra</option>
                <option value="temporal">Temporal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="vacaciones">En Vacaciones</option>
                <option value="licencia">Con Licencia</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Dirección
              </label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                name="emergency_contact"
                value={form.emergency_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Teléfono de Emergencia
              </label>
              <input
                type="tel"
                name="emergency_phone"
                value={form.emergency_phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Banco
              </label>
              <input
                type="text"
                name="bank_name"
                value={form.bank_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cuenta Bancaria
              </label>
              <input
                type="text"
                name="bank_account"
                value={form.bank_account}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}