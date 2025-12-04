"use client";

import React, { useState, useEffect } from "react";

const ASSET_CATEGORIES = [
  "Equipo de Cómputo",
  "Mobiliario y Equipo",
  "Vehículos",
  "Maquinaria",
  "Edificios",
  "Terrenos",
  "Herramientas",
  "Otro",
];

export default function AssetFormModal({ isOpen, onClose, onSave, asset, accounts }) {
  const [form, setForm] = useState({
    name: "",
    category: "",
    acquisition_date: new Date().toISOString().split("T")[0],
    acquisition_cost: "",
    useful_life_months: "60",
    salvage_value: "0",
    depreciation_method: "straight_line",
    account_asset_id: "",
    status: "active",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setForm({
        id: asset.id,
        name: asset.name || "",
        category: asset.category || "",
        acquisition_date: asset.acquisition_date || new Date().toISOString().split("T")[0],
        acquisition_cost: asset.acquisition_cost || "",
        useful_life_months: asset.useful_life_months || "60",
        salvage_value: asset.salvage_value || "0",
        depreciation_method: asset.depreciation_method || "straight_line",
        account_asset_id: asset.account_asset_id || "",
        status: asset.status || "active",
      });
    } else {
      setForm({
        name: "",
        category: "",
        acquisition_date: new Date().toISOString().split("T")[0],
        acquisition_cost: "",
        useful_life_months: "60",
        salvage_value: "0",
        depreciation_method: "straight_line",
        account_asset_id: "",
        status: "active",
      });
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSave({
      ...form,
      acquisition_cost: parseFloat(form.acquisition_cost) || 0,
      useful_life_months: parseInt(form.useful_life_months) || 60,
      salvage_value: parseFloat(form.salvage_value) || 0,
    });
    setSaving(false);
    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  const monthlyDepreciation =
    form.acquisition_cost && form.useful_life_months
      ? ((parseFloat(form.acquisition_cost) || 0) - (parseFloat(form.salvage_value) || 0)) /
        (parseInt(form.useful_life_months) || 1)
      : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-800">
            {asset ? "Editar Activo Fijo" : "Agregar Activo Fijo"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre del Activo *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Computadora Dell XPS"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Categoría
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Seleccionar</option>
                {ASSET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha de Adquisición *
              </label>
              <input
                type="date"
                value={form.acquisition_date}
                onChange={(e) => setForm({ ...form, acquisition_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Costo de Adquisición *
              </label>
              <input
                type="number"
                value={form.acquisition_cost}
                onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Valor Residual
              </label>
              <input
                type="number"
                value={form.salvage_value}
                onChange={(e) => setForm({ ...form, salvage_value: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Vida Útil (meses) *
              </label>
              <input
                type="number"
                value={form.useful_life_months}
                onChange={(e) => setForm({ ...form, useful_life_months: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="60"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Método de Depreciación
              </label>
              <select
                value={form.depreciation_method}
                onChange={(e) => setForm({ ...form, depreciation_method: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="straight_line">Línea Recta</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cuenta Contable de Activo
            </label>
            <select
              value={form.account_asset_id}
              onChange={(e) => setForm({ ...form, account_asset_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar cuenta</option>
              {(accounts || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Estado
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="active">Activo</option>
              <option value="disposed">Dado de baja</option>
            </select>
          </div>

          {monthlyDepreciation > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-600">Depreciación mensual estimada:</p>
              <p className="text-lg font-semibold text-blue-700">
                C$ {monthlyDepreciation.toLocaleString("es-NI", { maximumFractionDigits: 2 })}
              </p>
            </div>
          )}

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
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
