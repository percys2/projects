"use client";

import React from "react";

export default function HrFilters({
  search,
  setSearch,
  department,
  setDepartment,
  departments,
  status,
  setStatus,
}) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <input
        type="text"
        placeholder="Buscar por nombre, cargo o cédula..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />

      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        {departments.map((dept) => (
          <option key={dept} value={dept}>
            {dept === "TODOS" ? "Todos los departamentos" : dept}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
      >
        <option value="TODOS">Todos los estados</option>
        <option value="activo">Activo</option>
        <option value="inactivo">Inactivo</option>
        <option value="vacaciones">En vacaciones</option>
        <option value="licencia">Con licencia</option>
      </select>
    </div>
  );
}