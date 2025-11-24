import React, { useState, useEffect } from "react";

export default function TransactionModal({ isOpen, onClose, onSave, transaction }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    category: "",
    type: "expense",
    amount: 0,
    notes: "",
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date || new Date().toISOString().split("T")[0],
        description: transaction.description || "",
        category: transaction.category || "",
        type: transaction.type || "expense",
        amount: transaction.amount || 0,
        notes: transaction.notes || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split("T")[0],
        description: "",
        category: "",
        type: "expense",
        amount: 0,
        notes: "",
      });
    }
  }, [transaction, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">
          {transaction ? "Editar Transacción" : "Nueva Transacción"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange("type", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            >
              <option value="income">Ingreso</option>
              <option value="expense">Gasto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: Venta de productos"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => handleChange("category", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="Ej: Ventas, Sueldos, Servicios"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Monto (C$)</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleChange("amount", parseFloat(e.target.value))}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              rows="3"
              placeholder="Información adicional..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded text-sm hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
