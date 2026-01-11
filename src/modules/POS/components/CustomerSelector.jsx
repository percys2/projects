"use client";

import { useState, useEffect } from "react";
import { usePosStore } from "../store/usePosStore";
import { clientsService } from "../services/clientsService";
import { useParams } from "next/navigation";

export default function CustomerSelector() {
  const params = useParams();
  const orgSlug = params?.orgSlug;
  const setClient = usePosStore((s) => s.setClient);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      if (!orgSlug) return;
      const data = await clientsService.searchClients(orgSlug, query);
      setClients(data);
    };

    fetchClients();
  }, [query, orgSlug]);

  return (
    <div className="bg-white border rounded-xl p-3">
      <p className="text-xs font-medium mb-2">Buscar cliente</p>

      <input
        type="text"
        value={query}
        placeholder="Nombre, teléfono o ruc..."
        onChange={(e) => setQuery(e.target.value)}
        className="w-full text-xs p-2 border rounded-lg"
      />

      {clients.length > 0 && (
        <div className="bg-white border rounded-xl mt-2 max-h-40 overflow-y-auto">
          {clients.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                setClient(c);
                setQuery("");
              }}
              className="px-3 py-2 hover:bg-slate-100 text-xs cursor-pointer"
            >
              <p className="font-medium">{c.display_name || c.name}</p>
              <p className="text-[10px] text-slate-500">{c.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
