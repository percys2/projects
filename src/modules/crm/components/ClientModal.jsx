"use client";

import React, { useState, useEffect } from "react";

export default function ClientModal({ isOpen, onClose, onSave, client }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    municipio: "",
    animal_type: "",
    sales_stage: "prospecto",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        municipio: client.municipio || "",
        animal_type: client.animal_type || "",
        sales_stage: client.sales_stage || "prospecto",
      });
    } else {
      setForm({
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        city: "",
        municipio: "",
        animal_type: "",
        sales_stage: "prospecto",
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name.trim()) {
      alert("El nombre es requerido");
      return;
    }
    setSaving(true);
    try {
      await onSave(client ? { ...form, id: client.id } : form);
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const animalTypes = ["Bovino", "Porcino", "Avícola", "Equino", "Caprino", "Ovino", "Otro"];
  const salesStages = [
    { value: "prospecto", label: "Prospecto" },
    { value: "contacto", label: "Contacto Inicial" },
    { value: "visita", label: "Visita Programada" },
    { value: "cotizacion", label: "Cotización Enviada" },
    { value: "negociacion", label: "En Negociación" },
    { value: "cliente", label: "Cliente Activo" },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
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
                placeholder="Nombre"
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
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg"
              placeholder="8888-8888"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg"
              placeholder="Dirección completa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                placeholder="Ciudad"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Municipio</label>
              <input
                type="text"
                value={form.municipio}
                onChange={(e) => setForm({ ...form, municipio: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                placeholder="Municipio"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Tipo de Animal</label>
              <select
                value={form.animal_type}
                onChange={(e) => setForm({ ...form, animal_type: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              >
                <option value="">Seleccionar...</option>
                {animalTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Etapa de Venta</label>
              <select
                value={form.sales_stage}
                onChange={(e) => setForm({ ...form, sales_stage: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              >
                {salesStages.map((stage) => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}