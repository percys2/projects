"use client";

import { usePosStore } from "../store/usePosStore";

// Helper para obtener nombre de display
function getDisplayName(client) {
  if (!client) return null;
  if (client.display_name) return client.display_name;
  if (client.first_name || client.last_name) {
    return `${client.first_name || ''} ${client.last_name || ''}`.trim();
  }
  if (client.name && typeof client.name === 'string') return client.name;
  if (client.business_name) return client.business_name;
  if (client.nombre) return client.nombre;
  if (client.phone) return `Cliente ${client.phone}`;
  return `Cliente #${String(client.id).slice(0, 8)}`;
}

export default function CustomerHeader() {
  const client = usePosStore((s) => s.selectedClient);
  const clearClient = usePosStore((s) => s.clearClient);

  if (!client) 
    return (
      <div className="p-3 bg-slate-50 rounded-xl border text-xs text-slate-400">
        Ningun cliente seleccionado
      </div>
    );

  const displayName = getDisplayName(client);

  return (
    <div className="p-3 bg-blue-50 rounded-xl border border-blue-300 text-xs space-y-1">
      <div className="flex justify-between items-start">
        <p className="font-bold text-blue-900">{displayName}</p>
        <button 
          onClick={clearClient}
          className="text-blue-600 hover:text-blue-800 text-[10px]"
        >
          Cambiar
        </button>
      </div>
      {client.phone && <p className="text-slate-600">Tel: {client.phone}</p>}
      {client.address && <p className="text-slate-600">Dir: {client.address}</p>}
      {client.ruc && <p className="text-slate-600">RUC: {client.ruc}</p>}
    </div>
  );
}
