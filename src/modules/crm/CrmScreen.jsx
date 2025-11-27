"use client";

import React, { useState } from "react";
import { useCrm } from "./hooks/useCrm";
import CrmStats from "./components/CrmStats";
import CrmFilters from "./components/CrmFilters";
import PipelineBoard from "./components/PipelineBoard";
import ClientStagesTable from "./components/ClientStagesTable";
import OpportunityModal from "./components/OpportunityModal";
import ActivityModal from "./components/ActivityModal";
import SalesFunnel from "./components/SalesFunnel";
import ClientModal from "./components/ClientModal";

export default function CrmScreen({ orgSlug }) {
  const crm = useCrm(orgSlug);
  const [activeTab, setActiveTab] = useState("pipeline");

  if (crm.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando CRM...</p>
      </div>
    );
  }

  if (crm.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {crm.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-full mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            CRM - Pipeline de Ventas
          </h1>
          <p className="text-xs text-slate-500">
            Gestión del ciclo de ventas y seguimiento de clientes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={crm.openNewClient}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
          >
            + Nuevo Cliente
          </button>
          <button
            onClick={crm.openNewOpportunity}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
          >
            + Nueva Oportunidad
          </button>
        </div>
      </div>

      <CrmStats stats={crm.stats} />

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "pipeline"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setActiveTab("clients")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "clients"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Clientes por Etapa
            </button>
            <button
              onClick={() => setActiveTab("all-clients")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "all-clients"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Todos los Clientes ({crm.clients.length})
            </button>
            <button
              onClick={() => setActiveTab("funnel")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "funnel"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Embudo de Ventas
            </button>
          </nav>
        </div>

        {activeTab === "pipeline" && (
          <div className="p-4">
            <PipelineBoard
              pipelineData={crm.pipelineData}
              onMoveOpportunity={crm.moveOpportunityToStage}
              onEditOpportunity={crm.openEditOpportunity}
              onDeleteOpportunity={crm.deleteOpportunity}
              onAddActivity={crm.openActivityModal}
              onMarkWon={crm.markOpportunityWon}
              onMarkLost={crm.markOpportunityLost}
            />
          </div>
        )}

        {activeTab === "clients" && (
          <>
            <div className="px-4 py-3 border-b">
              <CrmFilters
                search={crm.search}
                setSearch={crm.setSearch}
                stageFilter={crm.stageFilter}
                setStageFilter={crm.setStageFilter}
                stages={crm.stages}
              />
            </div>
            <div className="p-4">
              <ClientStagesTable
                clientsByStage={crm.clientsByStage}
                stages={crm.stages}
                onViewOpportunities={crm.openEditOpportunity}
              />
            </div>
          </>
        )}

        {activeTab === "all-clients" && (
          <div className="p-4">
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={crm.search}
                onChange={(e) => crm.setSearch(e.target.value)}
                className="w-full max-w-md p-2 text-sm border rounded-lg"
              />
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left p-3 font-medium text-slate-600">Teléfono</th>
                  <th className="text-left p-3 font-medium text-slate-600">Ciudad</th>
                  <th className="text-left p-3 font-medium text-slate-600">Tipo Animal</th>
                  <th className="text-left p-3 font-medium text-slate-600">Etapa</th>
                  <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {crm.clients
                  .filter((c) => {
                    if (!crm.search) return true;
                    const term = crm.search.toLowerCase();
                    const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
                    return name.includes(term) || c.phone?.includes(term) || c.city?.toLowerCase().includes(term);
                  })
                  .map((client) => (
                    <tr key={client.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-medium">{client.first_name} {client.last_name}</td>
                      <td className="p-3 text-slate-500">{client.phone || "-"}</td>
                      <td className="p-3 text-slate-500">{client.city || "-"}</td>
                      <td className="p-3 text-slate-500">{client.animal_type || "-"}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
                          {client.sales_stage || "prospecto"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => crm.openEditClient(client)}
                          className="text-blue-600 hover:underline text-xs mr-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar este cliente?")) {
                              crm.deleteClient(client.id);
                            }
                          }}
                          className="text-red-600 hover:underline text-xs"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                {crm.clients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-slate-400">
                      No hay clientes. Haz clic en "+ Nuevo Cliente" para agregar uno.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "funnel" && (
          <div className="p-4">
            <SalesFunnel pipelineData={crm.pipelineData} />
          </div>
        )}
      </div>

      <OpportunityModal
        isOpen={crm.isOpportunityModalOpen}
        onClose={crm.closeOpportunityModal}
        onSave={crm.saveOpportunity}
        opportunity={crm.editingOpportunity}
        stages={crm.stages}
        clients={crm.clients}
      />

      <ActivityModal
        isOpen={crm.isActivityModalOpen}
        onClose={crm.closeActivityModal}
        onSave={crm.saveActivity}
        opportunity={crm.selectedOpportunityForActivity}
      />

      <ClientModal
        isOpen={crm.isClientModalOpen}
        onClose={crm.closeClientModal}
        onSave={crm.saveClient}
        client={crm.editingClient}
      />
    </div>
  );
}