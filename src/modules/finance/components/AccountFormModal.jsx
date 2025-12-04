"use client";

import React, { useState, useEffect } from "react";

const ACCOUNT_TYPES = [
  { value: "asset", label: "Activo" },
  { value: "liability", label: "Pasivo" },
  { value: "equity", label: "Capital" },
  { value: "income", label: "Ingreso" },
  { value: "expense", label: "Gasto" },
];

const SUBTYPES = {
  asset: [
    { value: "cash", label: "Efectivo" },
    { value: "bank", label: "Banco" },
    { value: "accounts_receivable", label: "Cuentas por Cobrar" },
    { value: "inventory", label: "Inventario" },
    { value: "fixed_asset", label: "Activo Fijo" },
    { value: "other", label: "Otro" },
  ],
  liability: [
    { value: "accounts_payable", label: "Cuentas por Pagar" },
    { value: "loans", label: "Préstamos" },
    { value: "taxes_payable", label: "Impuestos por Pagar" },
    { value: "other", label: "Otro" },
  ],
  equity: [
    { value: "capital", label: "Capital Social" },
    { value: "retained_earnings", label: "Utilidades Retenidas" },
    { value: "other", label: "Otro" },
  ],
  income: [
    { value: "sales", label: "Ventas" },
    { value: "services", label: "Servicios" },
    { value: "interest", label: "Intereses" },
    { value: "other", label: "Otro" },
  ],
  expense: [
    { value: "cogs", label: "Costo de Ventas" },
    { value: "operating_expense", label: "Gastos Operativos" },
    { value: "payroll", label: "Nómina" },
    { value: "utilities", label: "Servicios Públicos" },
    { value: "rent", label: "Alquiler" },
    { value: "depreciation", label: "Depreciación" },
    { value: "other", label: "Otro" },
  ],
};

export default function AccountFormModal({ isOpen, onClose, onSave, account, accounts }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "expense",
    subtype: "",
    parent_id: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (account) {
      setForm({
        id: account.id,
        code: account.code || "",
        name: account.name || "",
        type: account.type || "expense",
        subtype: account.subtype || "",
        parent_id: account.parent_id || "",
        is_active: account.is_active !== false,
      });
    } else {
      setForm({
        code: "",
        name: "",
        type: "expense",
        subtype: "",
        parent_id: "",
        is_active: true,
      });
    }
  }, [account, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSave(form);
    setSaving(false);
    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  const parentOptions = (accounts || []).filter(
    (a) => a.type === form.type && a.id !== form.id
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">
            {account ? "Editar Cuenta" : "Nueva Cuenta Contable"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Código *
              </label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="1101"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tipo *
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, subtype: "" })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Caja General"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Subtipo
              </label>
              <select
                value={form.subtype}
                onChange={(e) => setForm({ ...form, subtype: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Sin subtipo</option>
                {(SUBTYPES[form.type] || []).map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Cuenta Padre
              </label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Sin cuenta padre</option>
                {parentOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.code} - {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm text-slate-600">
              Cuenta activa
            </label>
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
