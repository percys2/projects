"use client";

import React, { useEffect, useState } from "react";

export default function PatientModal({ isOpen, onClose, onSave, patient }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    dob: "",
    sex: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (patient) {
      setForm({
        first_name: patient.first_name || "",
        last_name: patient.last_name || "",
        phone: patient.phone || "",
        email: patient.email || "",
        dob: patient.dob ? patient.dob.split("T")[0] : "",
        sex: patient.sex || "",
        address: patient.address || "",
        emergency_contact_name: patient.emergency_contact_name || "",
        emergency_contact_phone: patient.emergency_contact_phone || "",
        notes: patient.notes || "",
      });
    } else {
      setForm({
        first_name: "",
        last_name: "",
        phone: "",
        email: "",
        dob: "",
        sex: "",
        address: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        notes: "",
      });
    }
  }, [patient, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      alert("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave(patient ? { ...form, id: patient.id } : form);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-bold text-lg">{patient ? "Editar paciente" : "Nuevo paciente"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Nombre *</label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Apellido</label>
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Sexo</label>
              <select
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              >
                <option value="">Seleccionar...</option>
                <option value="F">F</option>
                <option value="M">M</option>
                <option value="O">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Dirección</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Contacto de emergencia</label>
              <input
                type="text"
                value={form.emergency_contact_name}
                onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Teléfono de emergencia</label>
              <input
                type="tel"
                value={form.emergency_contact_phone}
                onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Notas clínicas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg min-h-[90px]"
              placeholder="Alergias, antecedentes, observaciones..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : patient ? "Actualizar" : "Crear paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

