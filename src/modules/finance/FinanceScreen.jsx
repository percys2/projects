"use client";

import React, { useState, useEffect } from "react";
import { useFinanceData } from "./hooks/useFinanceData";
import FinanceSummaryCards from "./components/FinanceSummaryCards";
import TransactionsList from "./components/TransactionsList";
import TransactionModal from "./components/TransactionModal";
import FinanceReports from "./components/FinanceReports";
import AgroservicioKPIs from "./components/AgroservicioKPIs";

export default function FinanceScreen({ orgSlug }) {
  const { 
    transactions, 
    summary, 
    loading, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    refreshData 
  } = useFinanceData(orgSlug);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState("transactions");

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (transactionData) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = async (id) => {
    if (confirm("¿Está seguro de eliminar esta transacción?")) {
      await deleteTransaction(id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando datos financieros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Finanzas</h1>
          <p className="text-xs text-slate-500">
            Gestión de ingresos, gastos y reportes financieros
          </p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800"
        >
          + Nueva Transacción
        </button>
      </div>

      {/* Summary Cards */}
      <FinanceSummaryCards summary={summary} />

      {/* Tabs */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("transactions")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "transactions"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Transacciones
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "reports"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Reportes
            </button>
            <button
              onClick={() => setActiveTab("kpis")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "kpis"
                  ? "border-b-2 border-slate-900 text-slate-900"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              KPIs Agroservicio
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === "transactions" ? (
            <TransactionsList
              transactions={transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          ) : activeTab === "reports" ? (
            <FinanceReports transactions={transactions} summary={summary} />
          ) : (
            <AgroservicioKPIs orgSlug={orgSlug} />
          )}
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
    </div>
  );
}
