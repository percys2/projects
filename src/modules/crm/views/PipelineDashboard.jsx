"use client";

import { usePipelineStore } from "../store/usePipelineStore";

export default function PipelineDashboard() {
  const stats = usePipelineStore((s) => s.stats);

  const stages = [
    { key: "lead", label: "Lead", color: "bg-slate-200" },
    { key: "prospecto", label: "Prospecto", color: "bg-blue-200" },
    { key: "activo", label: "Activo", color: "bg-green-200" },
    { key: "frecuente", label: "Frecuente", color: "bg-yellow-300" },
    { key: "alto", label: "Alto Valor", color: "bg-purple-300" },
    { key: "inactivo", label: "Inactivo", color: "bg-red-300" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {stages.map((s) => (
        <div
          key={s.key}
          className={`p-4 rounded-xl shadow ${s.color}`}
        >
          <p className="text-sm font-semibold">{s.label}</p>
          <h2 className="text-2xl font-bold">{stats[s.key]}</h2>
        </div>
      ))}
    </div>
  );
}

