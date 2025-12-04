"use client";

import { useEffect, useState } from "react";
import ClientForm from "../components/ClientForm";
import ClientTable from "../components/ClientTable";
import WhatsAppMassSender from "../components/WhatsAppMassSender";
import { useClientStore } from "../store/useClientStore";

export default function ClientScreen() {
  const load = useClientStore((s) => s.loadClients);
  const [openForm, setOpenForm] = useState(false);
  const [openMass, setOpenMass] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">CRM - Clientes</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setOpenMass(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            📢 WhatsApp Masivo
          </button>

          <button
            onClick={() => {
              setSelected(null);
              setOpenForm(true);
            }}
            className="bg-black text-white px-4 py-2 rounded-lg"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <ClientTable onEdit={(c) => {
        setSelected(c);
        setOpenForm(true);
      }} />

      {openForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <ClientForm selected={selected} onClose={() => setOpenForm(false)} />
        </div>
      )}

      {openMass && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <WhatsAppMassSender onClose={() => setOpenMass(false)} />
        </div>
      )}
    </div>
  );
}
