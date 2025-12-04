"use client";

import React, { useState, useEffect } from "react";

export default function ExpenseFormModal({
  isOpen,
  onClose,
  onSave,
  expense,
  suppliers,
  accounts,
}) {
  const [form, setForm] = useState({
    supplier_id: "",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    reference: "",
    notes: "",
    items: [{ account_id: "", description: "", amount: "" }],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (expense) {
      setForm({
        id: expense.id,
        supplier_id: expense.supplier_id || "",
        date: expense.date || new Date().toISOString().split("T")[0],
        due_date: expense.due_date || "",
        reference: expense.reference || "",
        notes: expense.notes || "",
        items: expense.items?.length
          ? expense.items
          : [{ account_id: "", description: "", amount: "" }],
      });
    } else {
      setForm({
        supplier_id: "",
        date: new Date().toISOString().split("T")[0],
        due_date: "",
        reference: "",
        notes: "",
        items: [{ account_id: "", description: "", amount: "" }],
      });
    }
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { account_id: "", description: "", amount: "" }],
    });
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setForm({ ...form, items: newItems });
  };

  const total = form.items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSave({
      ...form,
      total,
      items: form.items.filter((item) => item.amount),
    });
    setSaving(false);
    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-4 py-3 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-semibold text-slate-800">
            {expense ? "Editar Gasto" : "Registrar Gasto"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Proveedor
              </label>
              <select
                value={form.supplier_id}
                onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Sin proveedor</option>
                {(suppliers || []).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Referencia / Factura
              </label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="FAC-001"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Descripción del gasto..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-medium text-slate-600">
                Detalle de Gastos
              </label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                + Agregar línea
              </button>
            </div>

            <div className="space-y-2">
              {form.items.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <select
                    value={item.account_id}
                    onChange={(e) => updateItem(index, "account_id", e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Cuenta de gasto</option>
                    {(accounts || []).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder="Descripción"
                  />
                  <input
                    type="number"
                    value={item.amount}
                    onChange={(e) => updateItem(index, "amount", e.target.value)}
                    className="w-28 border rounded-lg px-3 py-2 text-sm text-right"
                    placeholder="0.00"
                    step="0.01"
                  />
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-2 py-2 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t">
              <div className="text-right">
                <span className="text-sm text-slate-500">Total: </span>
                <span className="text-lg font-semibold text-slate-800">
                  C$ {total.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
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
              disabled={saving || total === 0}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
