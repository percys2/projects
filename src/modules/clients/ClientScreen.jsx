"use client";

import React, { useEffect, useState } from "react";
import { useClientStore } from "./store/useClientStore";

export default function ClientScreen() {
  const { clients, loadClients } = useClientStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      await loadClients();  
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Clientes / CRM</h1>

      {clients.length === 0 ? (
        <p className="text-slate-500">No hay clientes registrados.</p>
      ) : (
        clients.map((c) => (
          <div key={c.id} className="border p-3 mb-2 rounded">
            <p className="font-semibold">{c.name}</p>
            <p className="text-sm text-slate-500">{c.phone}</p>
          </div>
        ))
      )}
    </div>
  );
}
