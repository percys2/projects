"use client";

import React, { useState, useEffect } from "react";

export default function ClientModal({ isOpen, onClose, onSave, client }) {
  const [form, setForm] = useState({
    account_number: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    city: "",
    municipio: "",
    animal_type: "",
    sales_stage: "prospecto",
    is_credit_client: false,
    credit_limit: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        account_number: client.account_number || "",
        first_name: client.first_name || "",
        last_name: client.last_name || "",
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        municipio: client.municipio || "",
        animal_type: client.animal_type || "",
        sales_stage: client.sales_stage || "prospecto",
        is_credit_client: client.is_credit_client || false,
        credit_limit: client.credit_limit || 0,
      });
    } else {
      setForm({
        account_number: "",
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        city: "",
        municipio: "",
        animal_type: "",
        sales_stage: "prospecto",
        is_credit_client: false,
        credit_limit: 0,
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

  const animalTypes = ["Bovino", "Porcino", "Avicola", "Equino", "Caprino", "Ovino", "Otro"];
  const salesStages = [
    { value: "prospecto", label: "Prospecto" },
    { value: "contacto", label: "Contacto Inicial" },
    { value: "visita", label: "Visita Programada" },
    { value: "cotizacion", label: "Cotizacion Enviada" },
    { value: "negociacion", label: "En Negociacion" },
    { value: "cliente", label: "Cliente Activo" },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-bold text-lg">{client ? "Editar Cliente" : "Nuevo Cliente"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Account Number */}
          <div className="bg-slate-50 p-3 rounded-lg border">
            <label className="text-xs font-medium text-slate-600">Numero de Cuenta</label>
            <input
              type="number"
              value={form.account_number}
              onChange={(e) => setForm({ ...form, account_number: e.target.value ? parseInt(e.target.value) : "" })}
              className="w-full p-2 text-sm border rounded-lg mt-1 font-bold text-lg"
              placeholder="Ej: 1, 2, 3..."
              min="1"
              max="999"
            />
            <p className="text-[10px] text-slate-400 mt-1">Numero unico para identificar al cliente (1-217)</p>
          </div>

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
            <label className="text-xs font-medium text-slate-600">Telefono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg"
              placeholder="8888-8888"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Direccion</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg"
              placeholder="Direccion completa"
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

          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Configuracion de Credito</h3>
            
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_credit_client}
                  onChange={(e) => setForm({ ...form, is_credit_client: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
              <span className="text-sm text-slate-700">Cliente de Credito</span>
              {form.is_credit_client && (
                <span className="ml-auto px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                  CREDITO ACTIVO
                </span>
              )}
            </div>

            {form.is_credit_client && (
              <div className="space-y-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <label className="text-xs font-medium text-slate-600">Limite de Credito (C$)</label>
                  <input
                    type="number"
                    value={form.credit_limit}
                    onChange={(e) => setForm({ ...form, credit_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 text-sm border rounded-lg mt-1"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {client && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-purple-200">
                    <div>
                      <p className="text-xs text-slate-500">Saldo Actual</p>
                      <p className="text-sm font-bold text-red-600">
                        {formatCurrency(client.credit_balance || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Disponible</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency((form.credit_limit || 0) - (client.credit_balance || 0))}
                      </p>
                    </div>
                  </div>
                )}

                {client && (client.credit_balance || 0) > form.credit_limit && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    El limite no puede ser menor al saldo actual ({formatCurrency(client.credit_balance)})
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving || (form.is_credit_client && client && (client.credit_balance || 0) > form.credit_limit)} 
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
