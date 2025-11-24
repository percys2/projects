"use client";

import React, { useState, useEffect } from "react";
import { useSalesData } from "./hooks/useSalesData";
import SalesForm from "./views/SalesForm";
import SalesList from "./components/SalesList";
import SalesStats from "./components/SalesStats";

export default function SalesScreen({ orgSlug }) {
  const { sales, stats, loading, addSale, updateSale, deleteSale } = useSalesData(orgSlug);
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [activeTab, setActiveTab] = useState("list");

  const handleSaveSale = async (saleData) => {
    if (editingSale) {
      await updateSale(editingSale.id, saleData);
    } else {
      await addSale(saleData);
    }
    setShowForm(false);
    setEditingSale(null);
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDeleteSale = async (id) => {
    if (confirm("¿Está seguro de eliminar esta venta?")) {
      await deleteSale(id);
    }
  };

  const handleNewSale = () => {
    setEditingSale(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando ventas...</p>
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-4">
          <button
            onClick={() => {
              setShowForm(false);
              setEditingSale(null);
            }}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            ← Volver a la lista
          </button>
        </div>
        <SalesForm onSave={handleSaveSale} initialData={editingSale} />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Ventas</h1>
          <p className="text-xs text-slate-500">
            Gestión de ventas, márgenes y reportes
          </p>
        </div>
        <button
          onClick={handleNewSale}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
        >
          + Nueva Venta
        </button>
      </div>

      {/* Stats */}
      <SalesStats stats={stats} />

      {/* Tabs */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "list"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Lista de Ventas
            </button>
            <button
              onClick={() => setActiveTab("stats")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "stats"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Estadísticas
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === "list" ? (
            <SalesList
              sales={sales}
              onEdit={handleEditSale}
              onDelete={handleDeleteSale}
            />
          ) : (
            <div className="py-8 text-center text-slate-500">
              <p>Estadísticas detalladas próximamente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
