"use client";

import React, { useState } from "react";
import { ACTIVITY_TYPES } from "../services/crmConfig";

export default function ActivityModal({ isOpen, onClose, onSave, opportunity }) {
  const [form, setForm] = useState({
    type: "llamada",
    subject: "",
    description: "",
    outcome: "",
    next_step: "",
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = {
      ...form,
      opportunity_id: opportunity.id,
      client_id: opportunity.client_id,
      completed_at: new Date().toISOString(),
    };
    const result = await onSave(data);
    setSaving(false);
    if (result.success) {
      setForm({ type: "llamada", subject: "", description: "", outcome: "", next_step: "" });
    } else {
      alert(result.error || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold">Registrar Actividad</h2>
            <p className="text-sm text-slate-500">{opportunity.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Tipo de Actividad *</label>
            <div className="flex flex-wrap gap-2">
              {ACTIVITY_TYPES.map((actType) => (
                <button key={actType.code} type="button"
                  onClick={() => setForm((prev) => ({ ...prev, type: actType.code }))}
                  className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                    form.type === actType.code
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                  }`}>
                  {actType.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Asunto *</label>
            <input type="text" name="subject" value={form.subject} onChange={handleChange} required
              placeholder="Ej: Llamada de seguimiento"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={2}
              placeholder="Detalles de la actividad..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Resultado</label>
            <input type="text" name="outcome" value={form.outcome} onChange={handleChange}
              placeholder="Ej: Cliente interesado, solicitó cotización"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Próximo Paso</label>
            <input type="text" name="next_step" value={form.next_step} onChange={handleChange}
              placeholder="Ej: Enviar cotización el lunes"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar Actividad"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}