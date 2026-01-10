"use client";

import { useState, useEffect } from "react";
import { usePosStore } from "../store/usePosStore";
import { clientsService } from "../services/clientsService";
import { formatCurrency } from "../utils/formatCurrency";

export default function CustomerSelector({ onCreditSettings, onCreditHistory }) {
  const setClient = usePosStore((s) => s.setClient);
  const selectedClient = usePosStore((s) => s.selectedClient);
  const [query, setQuery] = useState("");
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const data = await clientsService.searchClients(query);
      setClients(data);
    };

    fetchClients();
  }, [query]);

  const handleSelectClient = (c) => {
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

      {query.length > 0 && (
        <div className="bg-white border rounded-xl mt-2 max-h-40 overflow-y-auto">
          {clients.map((c) => (
            <div
              key={c.id}
              onClick={() => handleSelectClient(c)}
              className="px-3 py-2 hover:bg-slate-100 text-xs cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{c.first_name} {c.last_name}</p>
                  <p className="text-[10px] text-slate-500">{c.phone}</p>
                </div>
                {c.is_credit_client && (
                  <span className="bg-purple-100 text-purple-700 text-[9px] px-1.5 py-0.5 rounded font-medium">
                    CREDITO
                  </span>
                )}
              </div>
              {c.is_credit_client && (
                <div className="mt-1 text-[10px] text-slate-500">
                  Disponible: {formatCurrency((c.credit_limit || 0) - (c.credit_balance || 0))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedClient && (
        <div className="mt-3 p-2 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium">
                {selectedClient.first_name} {selectedClient.last_name}
              </p>
              <p className="text-[10px] text-slate-500">{selectedClient.phone}</p>
            </div>
            <button
              onClick={() => setClient(null)}
              className="text-red-500 text-xs hover:text-red-700"
            >
              Quitar
            </button>
          </div>

          {selectedClient.is_credit_client && (
            <div className="mt-2 p-2 bg-purple-50 rounded border border-purple-200">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-600">Limite:</span>
                <span className="font-medium">{formatCurrency(selectedClient.credit_limit || 0)}</span>
              </div>
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-slate-600">Saldo:</span>
                <span className="font-medium text-red-600">{formatCurrency(selectedClient.credit_balance || 0)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-600">Disponible:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency((selectedClient.credit_limit || 0) - (selectedClient.credit_balance || 0))}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-1 mt-2">
            {onCreditSettings && (
              <button
                onClick={() => onCreditSettings(selectedClient)}
                className="flex-1 text-[10px] py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
              >
                {selectedClient.is_credit_client ? "Config. Credito" : "Habilitar Credito"}
              </button>
            )}
            {selectedClient.is_credit_client && onCreditHistory && (
              <button
                onClick={() => onCreditHistory(selectedClient)}
                className="flex-1 text-[10px] py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Ver Historial
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
