"use client";

import React, { useMemo, useState } from "react";

function ToothSvg({ fill = "#e2e8f0", stroke = "#0f172a", selected = false }) {
  // Stylized tooth (simple but "pretty") - scalable, consistent.
  return (
    <svg viewBox="0 0 64 64" className="w-10 h-10">
      <path
        d="M32 6c-8.5 0-16 6-16 15 0 4.7 1.2 8.6 2.6 12.1 1.2 3.1 2.6 6.4 3.2 10.8.8 6.2 1.9 11.1 4.8 11.1 2.6 0 2.9-4.5 3.3-8.3.5-4.1.9-7.7 2.1-7.7 1.2 0 1.6 3.6 2.1 7.7.4 3.8.7 8.3 3.3 8.3 2.9 0 4-4.9 4.8-11.1.6-4.4 2-7.7 3.2-10.8C46.8 29.6 48 25.7 48 21 48 12 40.5 6 32 6Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {selected && (
        <path
          d="M32 6c-8.5 0-16 6-16 15 0 4.7 1.2 8.6 2.6 12.1 1.2 3.1 2.6 6.4 3.2 10.8.8 6.2 1.9 11.1 4.8 11.1 2.6 0 2.9-4.5 3.3-8.3.5-4.1.9-7.7 2.1-7.7 1.2 0 1.6 3.6 2.1 7.7.4 3.8.7 8.3 3.3 8.3 2.9 0 4-4.9 4.8-11.1.6-4.4 2-7.7 3.2-10.8C46.8 29.6 48 25.7 48 21 48 12 40.5 6 32 6Z"
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
        />
      )}
    </svg>
  );
}

const STATUS_PRESETS = [
  { key: "healthy", label: "Sano", color: "#e2e8f0" },
  { key: "caries", label: "Caries", color: "#fb7185" },
  { key: "filling", label: "Obturación", color: "#60a5fa" },
  { key: "crown", label: "Corona", color: "#a78bfa" },
  { key: "root_canal", label: "Endodoncia", color: "#fbbf24" },
  { key: "missing", label: "Ausente", color: "#94a3b8" },
];

function buildAdultTeethFDI() {
  // Upper: 18..11, 21..28 (16)
  // Lower: 48..41, 31..38 (16)  (display left->right = upper right to upper left; lower right to lower left)
  const upperRight = ["18", "17", "16", "15", "14", "13", "12", "11"];
  const upperLeft = ["21", "22", "23", "24", "25", "26", "27", "28"];
  const lowerRight = ["48", "47", "46", "45", "44", "43", "42", "41"];
  const lowerLeft = ["31", "32", "33", "34", "35", "36", "37", "38"];
  return {
    upper: [...upperRight, ...upperLeft],
    lower: [...lowerRight, ...lowerLeft],
  };
}

export default function OdontogramModal({ isOpen, onClose, patient, onSaveOdontogram }) {
  const teeth = useMemo(() => buildAdultTeethFDI(), []);
  const [selectedTooth, setSelectedTooth] = useState("11");
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState(() => {
    const existing = patient?.odontogram && typeof patient.odontogram === "object" ? patient.odontogram : null;
    return existing || { version: 1, teeth: {} };
  });

  // When patient changes and modal is opened, reset draft.
  React.useEffect(() => {
    if (!isOpen) return;
    const existing = patient?.odontogram && typeof patient.odontogram === "object" ? patient.odontogram : null;
    setDraft(existing || { version: 1, teeth: {} });
    setSelectedTooth("11");
  }, [patient?.id, isOpen]);

  if (!isOpen) return null;

  const toothData = (draft?.teeth && draft.teeth[selectedTooth]) || {};
  const status = toothData.status || "healthy";
  const statusPreset = STATUS_PRESETS.find((s) => s.key === status) || STATUS_PRESETS[0];

  const setTooth = (toothId, patch) => {
    setDraft((prev) => {
      const next = prev && typeof prev === "object" ? { ...prev } : { version: 1, teeth: {} };
      const teethMap = next.teeth && typeof next.teeth === "object" ? { ...next.teeth } : {};
      const current = teethMap[toothId] && typeof teethMap[toothId] === "object" ? { ...teethMap[toothId] } : {};
      const updated = { ...current, ...patch };
      teethMap[toothId] = updated;
      next.teeth = teethMap;
      next.updated_at = new Date().toISOString();
      return next;
    });
  };

  const clearTooth = (toothId) => {
    setDraft((prev) => {
      const next = prev && typeof prev === "object" ? { ...prev } : { version: 1, teeth: {} };
      const teethMap = next.teeth && typeof next.teeth === "object" ? { ...next.teeth } : {};
      delete teethMap[toothId];
      next.teeth = teethMap;
      next.updated_at = new Date().toISOString();
      return next;
    });
  };

  const renderRow = (ids) => (
    <div className="flex flex-wrap gap-2 justify-center">
      {ids.map((id, idx) => {
        const tooth = (draft?.teeth && draft.teeth[id]) || {};
        const st = tooth.status || "healthy";
        const preset = STATUS_PRESETS.find((s) => s.key === st) || STATUS_PRESETS[0];
        const isSelected = selectedTooth === id;
        const isMidGap = idx === 7; // between quadrants
        return (
          <div key={id} className={`flex flex-col items-center ${isMidGap ? "mr-4" : ""}`}>
            <button
              type="button"
              onClick={() => setSelectedTooth(id)}
              className={`p-1 rounded-xl transition ${
                isSelected ? "bg-blue-50 ring-2 ring-blue-500" : "hover:bg-slate-50"
              }`}
              title={`Diente ${id}`}
            >
              <ToothSvg fill={preset.color} stroke="#0f172a" selected={isSelected} />
            </button>
            <span className="text-[11px] text-slate-600 mt-1">{id}</span>
          </div>
        );
      })}
    </div>
  );

  const handleSave = async () => {
    if (!patient?.id) return;
    setSaving(true);
    try {
      await onSaveOdontogram({ patientId: patient.id, odontogram: draft });
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
        className="bg-white rounded-xl w-full max-w-5xl m-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="font-bold text-lg">Odontograma</h2>
            <p className="text-xs text-slate-500">
              {patient?.first_name} {patient?.last_name || ""} • selecciona un diente para editar
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-5">
          <div className="rounded-xl border bg-gradient-to-b from-slate-50 to-white p-4">
            <div className="text-xs font-semibold text-slate-700 mb-3">Arcada superior</div>
            {renderRow(teeth.upper)}
            <div className="mt-5 text-xs font-semibold text-slate-700 mb-3">Arcada inferior</div>
            {renderRow(teeth.lower)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1 border rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-slate-500">Diente seleccionado</p>
                  <p className="text-lg font-bold text-slate-900">{selectedTooth}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ToothSvg fill={statusPreset.color} stroke="#0f172a" selected />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Estado</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_PRESETS.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setTooth(selectedTooth, { status: s.key })}
                        className={`px-2.5 py-1.5 rounded-full text-xs border transition ${
                          status === s.key
                            ? "border-slate-900 text-slate-900 bg-slate-100"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        title={s.label}
                      >
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-600 mb-2">Notas del diente</p>
                  <textarea
                    value={toothData.notes || ""}
                    onChange={(e) => setTooth(selectedTooth, { notes: e.target.value })}
                    className="w-full p-2 text-sm border rounded-lg min-h-[100px]"
                    placeholder="Ej: caries distal, sensibilidad..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => clearTooth(selectedTooth)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Limpiar diente seleccionado
                </button>
              </div>
            </div>

            <div className="md:col-span-2 border rounded-xl p-4 bg-white">
              <p className="text-xs font-medium text-slate-600 mb-2">Resumen rápido</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STATUS_PRESETS.map((s) => {
                  const count = Object.values(draft?.teeth || {}).filter((t) => (t?.status || "healthy") === s.key).length;
                  return (
                    <div key={s.key} className="p-3 rounded-xl border bg-slate-50">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-slate-600">{s.label}</div>
                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">{count}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-500">
                  Consejo: usa el estado “Sano” para marcar dientes evaluados. “Ausente” para piezas faltantes.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar odontograma"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

