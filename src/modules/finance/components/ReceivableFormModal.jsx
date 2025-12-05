"use client";

import React, { useState, useEffect } from "react";

export default function ReceivableFormModal({
  isOpen,
  onClose,
  onSave,
  receivable,
  clients,
}) {
  const [form, setForm] = useState({
    client_id: "",
    factura: "",
    fecha: new Date().toISOString().split("T")[0],
    due_date: "",
    total: "",
    amount_paid: "0",
    status: "pending",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (receivable) {
      setForm({
        id: receivable.id,
        client_id: receivable.client_id || "",
        factura: receivable.factura || "",
        fecha: receivable.fecha || new Date().toISOString().split("T")[0],
        due_date: receivable.due_date || "",
        total: receivable.total || "",
        amount_paid: receivable.amount_paid || "0",
        status: receivable.status || "pending",
        notes: receivable.notes || "",
      });
    } else {
      setForm({
        client_id: "",
        factura: "",
        fecha: new Date().toISOString().split("T")[0],
        due_date: "",
        total: "",
        amount_paid: "0",
        status: "pending",
        notes: "",
      });
    }
  }, [receivable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSave({
      ...form,
      total: parseFloat(form.total) || 0,
      amount_paid: parseFloat(form.amount_paid) || 0,
    });
    setSaving(false);
    if (!result?.success) {
      alert(result?.error || "Error al guardar");
    }
  };

  const balance = (parseFloat(form.total) || 0) - (parseFloat(form.amount_paid) || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">
            {receivable ? "Editar Cuenta por Cobrar" : "Nueva Cuenta por Cobrar"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cliente *
            </label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              required
            >
              <option value="">Seleccionar cliente</option>
              {(clients || []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.first_name} {c.last_name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                No. Factura *
              </label>
              <input
                type="text"
                value={form.factura}
                onChange={(e) => setForm({ ...form, factura: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="FAC-001"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Fecha Vencimiento
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
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
                <option value="pending">Pendiente</option>
                <option value="partial">Parcial</option>
                <option value="paid">Pagado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Total *
              </label>
              <input
                type="number"
                value={form.total}
                onChange={(e) => setForm({ ...form, total: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Monto Pagado
              </label>
              <input
                type="number"
                value={form.amount_paid}
                onChange={(e) => setForm({ ...form, amount_paid: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Saldo Pendiente:</span>
              <span className={`font-semibold ${balance > 0 ? "text-red-600" : "text-green-600"}`}>
                C$ {balance.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
              </span>
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
              placeholder="Notas adicionales..."
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
              disabled={saving || !form.total || !form.client_id}
              className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {saving ? "Guardando..." : receivable ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
