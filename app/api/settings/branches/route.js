"use client";

import { useEffect, useState } from "react";

export default function BranchManager({ params }) {
  const orgSlug = params.orgSlug;
  const [branches, setBranches] = useState([]);
  const [name, setName] = useState("");

  async function load() {
    const res = await fetch("/api/branches/list", {
      headers: { "x-org-slug": orgSlug },
    });
    const json = await res.json();
    setBranches(json.branches || []);
  }

  async function createBranch() {
    if (!name.trim()) return;

    await fetch("/api/branches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgSlug, name }),
    });

    setName("");
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Administrar Sucursales</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border p-2 rounded"
          placeholder="Nombre de sucursal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={createBranch}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Crear
        </button>
      </div>

      <ul className="space-y-2">
        {branches.map((b) => (
          <li key={b.id} className="p-3 border rounded bg-white">
            <strong>{b.name}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
