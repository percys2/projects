"use client";

import React from "react";

export default function CrmFilters({
  search,
  setSearch,
  stageFilter,
  setStageFilter,
  stages,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Buscar por nombre o cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />

      <select
        value={stageFilter}
        onChange={(e) => setStageFilter(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <option value="TODOS">Todas las etapas</option>
        {stages.map((stage) => (
          <option key={stage.id} value={stage.id}>
            {stage.name}
          </option>
        ))}
      </select>
    </div>
  );
}

