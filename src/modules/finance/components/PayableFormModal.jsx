"use client";

import React, { useState, useEffect } from "react";

export default function PayableFormModal({
  isOpen,
  onClose,
  onSave,
  payable,
  suppliers,
  onCreateSupplier,
}) {
  const [formData, setFormData] = useState({
    supplier_id: "",
    reference: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    due_date: "",
    total: "",
    amount_paid: "0",
    notes: "",
  });
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: "",
    contact_name: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (payable) {
      setFormData({
        supplier_id: payable.supplier_id || "",
        reference: payable.reference || "",
        description: payable.description || "",
        date: payable.date || new Date().toISOString().split("T")[0],
        due_date: payable.due_date || "",
        total: payable.total?.toString() || "",
        amount_paid: payable.amount_paid?.toString() || "0",
        notes: payable.notes || "",
      });
    } else {
      setFormData({
        supplier_id: "",
        reference: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        due_date: "",
        total: "",
        amount_paid: "0",
        notes: "",
      });
    }
    setShowNewSupplier(false);
  }, [payable, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewSupplierChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSupplier = async () => {
    if (!newSupplier.name) {
      alert("El nombre del proveedor es requerido");
      return;
    }

    if (onCreateSupplier) {
      const result = await onCreateSupplier(newSupplier);
      if (result?.success && result?.supplier) {
        setFormData((prev) => ({ ...prev, supplier_id: result.supplier.id }));
        setShowNewSupplier(false);
        setNewSupplier({ name: "", contact_name: "", email: "", phone: "" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier_id) {
      alert("Debe seleccionar un proveedor");
      return;
    }
    if (!formData.total || parseFloat(formData.total) <= 0) {
      alert("El monto total debe ser mayor a 0");
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        total: parseFloat(formData.total) || 0,
        amount_paid: parseFloat(formData.amount_paid) || 0,
      };
      if (payable?.id) {
        data.id = payable.id;
      }
      await onSave(data);
    } finally {
      setSaving(false);
    }
  };

  const balance = (parseFloat(formData.total) || 0) - (parseFloat(formData.amount_paid) || 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {payable ? "Editar Cuenta por Pagar" : "Nueva Cuenta por Pagar"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Proveedor *
            </label>
            {!showNewSupplier ? (
              <div className="flex gap-2">
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  required
                >
                  <option value="">Seleccionar proveedor...</option>
                  {(suppliers || []).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.contact_name ? `(${s.contact_name})` : ""}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewSupplier(true)}
                  className="px-3 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700"
                >
                  + Nuevo
                </button>
              </div>
            ) : (
              <div className="border rounded-lg p-3 space-y-2 bg-slate-50">
                <p className="text-xs font-medium text-slate-600">Crear nuevo proveedor:</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Nombre empresa *"
                    value={newSupplier.name}
                    onChange={handleNewSupplierChange}
                    className="px-2 py-1.5 border rounded text-sm col-span-2"
                  />
                  <input
                    type="text"
                    name="contact_name"
                    placeholder="Contacto"
                    value={newSupplier.contact_name}
                    onChange={handleNewSupplierChange}
                    className="px-2 py-1.5 border rounded text-sm"
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Telefono"
                    value={newSupplier.phone}
                    onChange={handleNewSupplierChange}
                    className="px-2 py-1.5 border rounded text-sm"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={newSupplier.email}
                    onChange={handleNewSupplierChange}
                    className="px-2 py-1.5 border rounded text-sm col-span-2"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowNewSupplier(false)}
                    className="px-2 py-1 text-xs text-slate-600 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSupplier}
                    className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Crear Proveedor
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Referencia
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="CXP-001"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Descripcion
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descripcion de la cuenta por pagar"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha Vencimiento
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto Total *
              </label>
              <input
                type="number"
                name="total"
                value={formData.total}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-lg text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto Pagado
              </label>
              <input
                type="number"
                name="amount_paid"
                value={formData.amount_paid}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Saldo Pendiente
              </label>
              <div className="px-3 py-2 border rounded-lg text-sm bg-slate-50 font-medium text-red-600">
                C$ {balance.toLocaleString("es-NI", { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Notas adicionales..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {saving ? "Guardando..." : payable ? "Actualizar" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
