"use client";

import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { useCrm } from "./hooks/useCrm";
import CrmStats from "./components/CrmStats";
import PipelineBoard from "./components/PipelineBoard";
import OpportunityModal from "./components/OpportunityModal";
import ActivityModal from "./components/ActivityModal";
import SalesFunnel from "./components/SalesFunnel";
import ClientModal from "./components/ClientModal";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function CrmScreen({ orgSlug }) {
  const crm = useCrm(orgSlug);
  const [activeTab, setActiveTab] = useState("pipeline");

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-NI", {
      style: "currency",
      currency: "NIO",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const creditClients = crm.clients.filter(c => c.is_credit_client);
  const totalCreditBalance = creditClients.reduce((sum, c) => sum + (c.credit_balance || 0), 0);

  // AG Grid column definitions for All Clients
  const allClientsColumnDefs = useMemo(() => [
    {
      field: "account_number",
      headerName: "#",
      filter: "agNumberColumnFilter",
      width: 70,
      cellStyle: { fontWeight: "600" },
    },
    {
      field: "full_name",
      headerName: "Nombre",
      filter: "agTextColumnFilter",
      minWidth: 180,
      flex: 1,
      valueGetter: (params) => `${params.data.first_name || ""} ${params.data.last_name || ""}`.trim(),
      cellRenderer: (params) => {
        const isCredit = params.data.is_credit_client;
        return (
          <div className="flex items-center gap-2">
            <span>{params.value}</span>
            {isCredit && (
              <span className="px-1.5 py-0.5 text-[10px] bg-purple-100 text-purple-700 rounded-full">CREDITO</span>
            )}
          </div>
        );
      },
    },
    {
      field: "phone",
      headerName: "Telefono",
      filter: "agTextColumnFilter",
      width: 120,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "city",
      headerName: "Ciudad",
      filter: "agTextColumnFilter",
      width: 120,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "animal_type",
      headerName: "Tipo Animal",
      filter: "agTextColumnFilter",
      width: 110,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "sales_stage",
      headerName: "Etapa",
      filter: "agTextColumnFilter",
      width: 120,
      cellRenderer: (params) => (
        <span className="px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700">
          {params.value || "prospecto"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 140,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <div className="flex gap-2 items-center h-full">
          <button
            onClick={() => crm.openEditClient(params.data)}
            className="text-blue-600 hover:underline text-xs"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (confirm("Eliminar este cliente?")) {
                crm.deleteClient(params.data.id);
              }
            }}
            className="text-red-600 hover:underline text-xs"
          >
            Eliminar
          </button>
        </div>
      ),
    },
  ], [crm]);

  // AG Grid column definitions for Credit Clients
  const creditClientsColumnDefs = useMemo(() => [
    {
      field: "account_number",
      headerName: "#",
      filter: "agNumberColumnFilter",
      width: 70,
      cellStyle: { fontWeight: "600" },
    },
    {
      field: "full_name",
      headerName: "Cliente",
      filter: "agTextColumnFilter",
      minWidth: 180,
      flex: 1,
      valueGetter: (params) => `${params.data.first_name || ""} ${params.data.last_name || ""}`.trim(),
    },
    {
      field: "phone",
      headerName: "Telefono",
      filter: "agTextColumnFilter",
      width: 120,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "credit_limit",
      headerName: "Limite",
      filter: "agNumberColumnFilter",
      width: 120,
      type: "numericColumn",
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "credit_balance",
      headerName: "Saldo",
      filter: "agNumberColumnFilter",
      width: 120,
      type: "numericColumn",
      cellStyle: (params) => ({
        color: (params.value || 0) > 0 ? "#dc2626" : "#16a34a",
        fontWeight: "600",
      }),
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "available",
      headerName: "Disponible",
      filter: "agNumberColumnFilter",
      width: 120,
      type: "numericColumn",
      valueGetter: (params) => (params.data.credit_limit || 0) - (params.data.credit_balance || 0),
      cellStyle: (params) => ({
        color: params.value > 0 ? "#16a34a" : "#dc2626",
        fontWeight: "600",
      }),
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: (params) => (
        <button
          onClick={() => crm.openEditClient(params.data)}
          className="text-blue-600 hover:underline text-xs"
        >
          Editar
        </button>
      ),
    },
  ], [crm, formatCurrency]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

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
            Gestion del ciclo de ventas y seguimiento de clientes
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
              onClick={() => setActiveTab("credit-clients")}
              className={`px-4 py-3 text-sm font-medium ${
                activeTab === "credit-clients"
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Clientes Credito ({creditClients.length})
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

        {activeTab === "all-clients" && (
          <div className="p-4">
            <div className="ag-theme-alpine w-full" style={{ height: "calc(100vh - 350px)", minHeight: 400 }}>
              <AgGridReact
                rowData={crm.clients}
                columnDefs={allClientsColumnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[25, 50, 100, 200]}
                animateRows={true}
                enableCellTextSelection={true}
                rowHeight={40}
              />
            </div>
          </div>
        )}

        {activeTab === "credit-clients" && (
          <div className="p-4">
            <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Clientes de Credito</p>
                  <p className="text-xl font-bold text-purple-700">{creditClients.length}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Total Saldo Pendiente</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(totalCreditBalance)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Limite Total Otorgado</p>
                  <p className="text-xl font-bold text-slate-700">
                    {formatCurrency(creditClients.reduce((sum, c) => sum + (c.credit_limit || 0), 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="ag-theme-alpine w-full" style={{ height: "calc(100vh - 450px)", minHeight: 300 }}>
              <AgGridReact
                rowData={creditClients}
                columnDefs={creditClientsColumnDefs}
                defaultColDef={defaultColDef}
                pagination={true}
                paginationPageSize={50}
                paginationPageSizeSelector={[25, 50, 100, 200]}
                animateRows={true}
                enableCellTextSelection={true}
                rowHeight={40}
              />
            </div>
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
