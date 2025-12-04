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
  const firstStage = stages?.find((s) => s.sort_order === 1) || stages?.[0];

  const [form, setForm] = useState({
    title: "",
    client_id: "",
    amount: "",
    stage_id: firstStage?.id || "",
    expected_close_date: "",
    source: "",
    notes: "",
  });

  const [saving, setSaving] = useState(false);

  /* ===========================================
     LOAD FORM DATA
  ============================================ */
  useEffect(() => {
    if (!isOpen) return;

    if (opportunity) {
      setForm({
        title: opportunity.title || "",
        client_id: opportunity.client_id || "",
        amount: opportunity.amount?.toString() || "",
        stage_id: opportunity.stage_id || firstStage?.id || "",
        expected_close_date:
          opportunity.expected_close_date?.split("T")[0] || "",
        source: opportunity.source || "",
        notes: opportunity.notes || "",
      });
    } else {
      setForm({
        title: "",
        client_id: "",
        amount: "",
        stage_id: firstStage?.id || "",
        expected_close_date: "",
        source: "",
        notes: "",
      });
    }
  }, [opportunity, isOpen, stages]);

  if (!isOpen) return null;

  /* ===========================================
     HANDLE INPUT CHANGE
  ============================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ===========================================
     SUBMIT FORM
  ============================================ */
  const handleSubmit = async () => {
    setSaving(true);

    const safeStage =
      form.stage_id && form.stage_id !== ""
        ? form.stage_id
        : firstStage?.id || null;

    const data = {
      title: form.title.trim(),
      client_id: form.client_id || null,
      stage_id: safeStage,
      amount: Number(form.amount) || 0,
      expected_close_date: form.expected_close_date || null,
      source: form.source || null,
      notes: form.notes || null,
    };

    if (opportunity?.id) data.id = opportunity.id;

    const result = await onSave(data);

    setSaving(false);

    if (!result.success) {
      alert(result.error || "Error al guardar");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* HEADER */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {opportunity ? "Editar Oportunidad" : "Nueva Oportunidad"}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl"
          >
            &times;
          </button>
        </div>

        {/* FORM */}
        <div className="p-6 space-y-4">

          {/* TÍTULO */}
          <div>
            <label className="block text-xs font-medium mb-1">Título *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="Ej: Venta alimento - Finca La Esperanza"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* CLIENTE */}
          <div>
            <label className="block text-xs font-medium mb-1">Cliente</label>
            <select
              name="client_id"
              value={form.client_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
          </div>

          {/* MONTO + ETAPA */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Monto *</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Etapa *</label>
              <select
                name="stage_id"
                value={form.stage_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-lg text-sm"
              >
                {stages
                  .filter((s) => s.code !== "ganado" && s.code !== "perdido")
                  .map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* NOTAS */}
          <div>
            <label className="block text-xs font-medium mb-1">Notas</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* BOTONES */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
