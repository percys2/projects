"use client";

import { usePosStore } from "../store/usePosStore";

export default function CustomerHeader() {
  const client = usePosStore((s) => s.selectedClient);

  if (!client) 
    return (
      <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-400">
        Ningún cliente seleccionado
      </div>
    );

  return (
    <div className="p-3 bg-blue-50 rounded-xl border border-blue-300 text-xs space-y-1">
      <p className="font-bold text-blue-900">{client.name}</p>
      {client.phone && <p>📞 {client.phone}</p>}
      {client.address && <p>📍 {client.address}</p>}
      {client.ruc && <p>🧾 RUC: {client.ruc}</p>}
    </div>
  );
}
