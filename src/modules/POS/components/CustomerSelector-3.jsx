"use client";

import { useState, useEffect } from "react";
import { usePosStore } from "../store/usePosStore";
import { clientsService } from "../services/clientsService";

export default function CustomerSelector({ orgSlug }) {
  const setClient = usePosStore((s) => s.setClient);
  const selectedClient = usePosStore((s) => s.selectedClient);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!orgSlug) {
        console.log("[CustomerSelector] No orgSlug");
        return;
      }
      
      setLoading(true);
      try {
        const data = await clientsService.searchClients(orgSlug, query);
        console.log("[CustomerSelector] Got clients:", data?.length);
        setClients(data || []);
      } catch (err) {
        console.error("[CustomerSelector] Error:", err);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [query, orgSlug]);

  const handleSelectClient = (c) => {
    console.log("[CustomerSelector] Selected client:", c);
    setClient(c);
    setQuery("");
  };

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

      {loading && (
        <p className="text-[10px] text-slate-400 mt-1">Cargando...</p>
      )}

      {!loading && clients.length > 0 && (
        <div className="bg-white border rounded-xl mt-2 max-h-40 overflow-y-auto">
          {clients.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectClient(c)}
              className="px-3 py-2 hover:bg-slate-100 text-xs cursor-pointer"
            >
              <p className="font-medium">{c.first_name} {c.last_name || ""}</p>
              <p className="text-[10px] text-slate-500">{c.phone}</p>
              {c.is_credit_client && (
                <span className="text-[9px] bg-purple-100 text-purple-700 px-1 rounded">CREDITO</span>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-medium text-green-800">
                {selectedClient.first_name} {selectedClient.last_name || ""}
              </p>
              <p className="text-[10px] text-green-600">{selectedClient.phone}</p>
            </div>
            <button
              onClick={() => setClient(null)}
              className="text-red-500 text-[10px] hover:text-red-700"
            >
              Quitar
            </button>
          </div>
          {selectedClient.is_credit_client && (
            <p className="text-[9px] text-purple-600 mt-1">
              Crédito disponible: C$ {((selectedClient.credit_limit || 0) - (selectedClient.credit_balance || 0)).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
