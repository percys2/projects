"use client";

import React, { useState, useEffect } from "react";
import { OPPORTUNITY_SOURCES } from "../services/crmConfig";

export default function OpportunityModal({
  isOpen,
  onClose,
  onSave,
  opportunity,
  stages,
  clients,
}) {
  const [form, setForm] = useState({
    name: "",
    client_id: "",
    amount: "",
    stage_id: "",
    expected_close_date: "",
    source: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setForm({
        name: opportunity.name || "",
        client_id: opportunity.client_id || "",
        amount: opportunity.amount?.toString() || "",
        stage_id: opportunity.stage_id || "",
        expected_close_date: opportunity.expected_close_date?.split("T")[0] || "",
        source: opportunity.source || "",
        notes: opportunity.notes || "",
      });
    } else {
      const firstStage = stages.find((s) => s.sort_order === 1) || stages[0];
      setForm({
        name: "",
        client_id: "",
        amount: "",
        stage_id: firstStage?.id || "",
        expected_close_date: "",
        source: "",
        notes: "",
      });
    }
  }, [opportunity, stages, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = { ...form, amount: parseFloat(form.amount) || 0 };
    if (opportunity?.id) data.id = opportunity.id;
    const result = await onSave(data);
    setSaving(false);
    if (!result.success) alert(result.error || "Error al guardar");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {opportunity ? "Editar Oportunidad" : "Nueva Oportunidad"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre de la Oportunidad *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} required
              placeholder="Ej: Venta de semillas - Finca López"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Cliente</label>
            <select name="client_id" value={form.client_id} onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valor (C$) *</label>
              <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0" step="0.01"
                placeholder="0.00" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Etapa *</label>
              <select name="stage_id" value={form.stage_id} onChange={handleChange} required
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                <option value="">Seleccionar etapa...</option>
                {stages.filter((s) => s.code !== "ganado" && s.code !== "perdido").map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Esperada de Cierre</label>
              <input type="date" name="expected_close_date" value={form.expected_close_date} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Fuente</label>
              <select name="source" value={form.source} onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                <option value="">Seleccionar fuente...</option>
                {OPPORTUNITY_SOURCES.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3}
              placeholder="Detalles adicionales sobre la oportunidad..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}