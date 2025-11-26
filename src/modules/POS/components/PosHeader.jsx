"use client";

import { useBranchStore } from "../store/useBranchStore";

export default function PosHeader() {
  const branches = useBranchStore((s) => s.branches);
  const activeBranch = useBranchStore((s) => s.activeBranch);
  const setBranch = useBranchStore((s) => s.setBranch);

  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-lg font-semibold">Punto de Venta</h1>

      <select
        className="text-sm border rounded px-2 py-1"
        value={activeBranch}
        onChange={(e) => setBranch(e.target.value)}
      >
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
