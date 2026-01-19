"use client";

import React, { useEffect, useMemo, useState } from "react";

export default function AppointmentModal({ isOpen, onClose, onSave, appointment, patients }) {
  const [form, setForm] = useState({
    patient_id: "",
    dentist_name: "",
    scheduled_at: "",
    duration_minutes: 30,
    status: "scheduled",
    reason: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const patientOptions = useMemo(() => {
    return (patients || [])
      .slice()
      .sort((a, b) =>
        `${a.first_name || ""} ${a.last_name || ""}`.localeCompare(`${b.first_name || ""} ${b.last_name || ""}`)
      );
  }, [patients]);

  useEffect(() => {
    if (appointment) {
      const dt = appointment.scheduled_at ? new Date(appointment.scheduled_at) : null;
      const localIso = dt
        ? new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        : "";
      setForm({
        patient_id: appointment.patient_id || appointment.patient?.id || "",
        dentist_name: appointment.dentist_name || "",
        scheduled_at: localIso,
        duration_minutes: appointment.duration_minutes || 30,
        status: appointment.status || "scheduled",
        reason: appointment.reason || "",
        notes: appointment.notes || "",
      });
    } else {
      setForm({
        patient_id: "",
        dentist_name: "",
        scheduled_at: "",
        duration_minutes: 30,
        status: "scheduled",
        reason: "",
        notes: "",
      });
    }
  }, [appointment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patient_id) {
      alert("Selecciona un paciente");
      return;
    }
    if (!form.scheduled_at) {
      alert("Selecciona fecha y hora");
      return;
    }

    const scheduledAtIso = new Date(form.scheduled_at).toISOString();

    setSaving(true);
    try {
      await onSave(
        appointment
          ? {
              ...form,
              id: appointment.id,
              scheduled_at: scheduledAtIso,
              duration_minutes: parseInt(form.duration_minutes, 10) || 30,
            }
          : {
              ...form,
              scheduled_at: scheduledAtIso,
              duration_minutes: parseInt(form.duration_minutes, 10) || 30,
            }
      );
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-xl w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <h2 className="font-bold text-lg">{appointment ? "Editar cita" : "Nueva cita"}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Paciente *</label>
              <select
                value={form.patient_id}
                onChange={(e) => setForm({ ...form, patient_id: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                required
              >
                <option value="">Seleccionar...</option>
                {patientOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.first_name} {p.last_name || ""} {p.phone ? `- ${p.phone}` : ""}
                  </option>
                ))}
              </select>
              {patientOptions.length === 0 && (
                <p className="mt-1 text-[11px] text-amber-600">Crea un paciente primero para poder agendar citas.</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Profesional</label>
              <input
                type="text"
                value={form.dentist_name}
                onChange={(e) => setForm({ ...form, dentist_name: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                placeholder="Dr(a). ..."
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-600">Fecha y hora *</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Duración (min)</label>
              <input
                type="number"
                min="5"
                step="5"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Estado</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
              >
                <option value="scheduled">scheduled</option>
                <option value="confirmed">confirmed</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
                <option value="no_show">no_show</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Motivo</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full p-2 text-sm border rounded-lg"
                placeholder="Limpieza, dolor, control..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 text-sm border rounded-lg min-h-[90px]"
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
              disabled={saving || patientOptions.length === 0}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : appointment ? "Actualizar" : "Crear cita"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

