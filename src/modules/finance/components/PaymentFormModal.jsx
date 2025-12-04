"use client";

import React, { useState, useEffect } from "react";

export default function PaymentFormModal({
  isOpen,
  onClose,
  onSave,
  payment,
  clients,
  suppliers,
  cashAccounts,
  receivables,
  payables,
  payingBill,
}) {
  const [form, setForm] = useState({
    direction: "out",
    date: new Date().toISOString().split("T")[0],
    amount: "",
    method: "efectivo",
    account_id: "",
    client_id: "",
    supplier_id: "",
    sale_id: "",
    bill_id: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payment) {
      setForm({
        id: payment.id,
        direction: payment.direction || "out",
        date: payment.date || new Date().toISOString().split("T")[0],
        amount: payment.amount || "",
        method: payment.method || "efectivo",
        account_id: payment.account_id || "",
        client_id: payment.client_id || "",
        supplier_id: payment.supplier_id || "",
        sale_id: payment.sale_id || "",
        bill_id: payment.bill_id || "",
        notes: payment.notes || "",
      });
    } else if (payingBill) {
      const pendingAmount = (payingBill.total || 0) - (payingBill.amount_paid || 0);
      setForm({
        direction: "out",
        date: new Date().toISOString().split("T")[0],
        amount: pendingAmount,
        method: "efectivo",
        account_id: "",
        client_id: "",
        supplier_id: payingBill.supplier_id || "",
        sale_id: "",
        bill_id: payingBill.id,
        notes: `Pago factura ${payingBill.reference || ""}`,
      });
    } else {
      setForm({
        direction: "out",
        date: new Date().toISOString().split("T")[0],
        amount: "",
        method: "efectivo",
        account_id: "",
        client_id: "",
        supplier_id: "",
        sale_id: "",
        bill_id: "",
        notes: "",
      });
    }
  }, [payment, payingBill, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await onSave({
      ...form,
      amount: parseFloat(form.amount) || 0,
    });
    setSaving(false);
    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">
            {payment ? "Editar Pago/Cobro" : payingBill ? "Pagar Factura" : "Registrar Pago/Cobro"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tipo *
              </label>
              <select
                value={form.direction}
                onChange={(e) =>
                  setForm({
                    ...form,
                    direction: e.target.value,
                    client_id: "",
                    supplier_id: "",
                    sale_id: "",
                    bill_id: "",
                  })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
                disabled={!!payingBill}
              >
                <option value="in">Cobro (Entrada)</option>
                <option value="out">Pago (Salida)</option>
              </select>
            </div>
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Monto *
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Método de Pago *
              </label>
              <select
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="rapibac">Depósito Rapibac</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Cuenta de Caja/Banco
            </label>
            <select
              value={form.account_id}
              onChange={(e) => setForm({ ...form, account_id: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Seleccionar cuenta</option>
              {(cashAccounts || []).map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} - {a.name}
                </option>
              ))}
            </select>
          </div>

          {form.direction === "in" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Cliente
                </label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sin cliente</option>
                  {(clients || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Factura por Cobrar
                </label>
                <select
                  value={form.sale_id}
                  onChange={(e) => setForm({ ...form, sale_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Sin factura asociada</option>
                  {(receivables || [])
                    .filter((r) => !form.client_id || r.client_id === form.client_id)
                    .map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.factura} - C$ {((r.total || 0) - (r.amount_paid || 0)).toLocaleString("es-NI")}
                      </option>
                    ))}
                </select>
              </div>
            </>
          )}

          {form.direction === "out" && (
            <>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Proveedor
                </label>
                <select
                  value={form.supplier_id}
                  onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  disabled={!!payingBill}
                >
                  <option value="">Sin proveedor</option>
                  {(suppliers || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              {!payingBill && (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Factura por Pagar
                  </label>
                  <select
                    value={form.bill_id}
                    onChange={(e) => setForm({ ...form, bill_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Sin factura asociada</option>
                    {(payables || [])
                      .filter((p) => !form.supplier_id || p.supplier_id === form.supplier_id)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.reference} - C$ {((p.total || 0) - (p.amount_paid || 0)).toLocaleString("es-NI")}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              rows={2}
              placeholder="Descripción del pago..."
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
              disabled={saving || !form.amount}
              className={`px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                form.direction === "in"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {saving ? "Guardando..." : form.direction === "in" ? "Registrar Cobro" : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
