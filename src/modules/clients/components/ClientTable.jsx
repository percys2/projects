"use client";

import { useClientStore } from "../store/useClientStore";
import PipelineBadge from "./PipelineBadge";

export default function ClientTable({ onSelect }) {
  const clients = useClientStore((s) => s.clients);

  return (
    <table className="w-full border rounded-xl overflow-hidden">
      <thead className="bg-slate-100">
        <tr>
          <th className="p-2 text-left">Cliente</th>
          <th className="p-2">Teléfono</th>
          <th className="p-2">Tipo</th>
          <th className="p-2">Pipeline</th>
        </tr>
      </thead>

      <tbody>
        {clients.map((c) => (
          <tr
            key={c.id}
            className="border-b hover:bg-slate-50 cursor-pointer"
            onClick={() => onSelect(c)}
          >
            <td className="p-2">{c.name}</td>
            <td className="p-2">{c.phone}</td>
            <td className="p-2 capitalize">{c.type}</td>
            <td className="p-2">
              <PipelineBadge pipeline={c.pipeline} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
