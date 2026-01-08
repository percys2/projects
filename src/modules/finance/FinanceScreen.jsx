"use client";

import React, { useState } from "react";
import { useFinance } from "./hooks/useFinance";
import ExpenseFormModal from "./components/ExpenseFormModal";
import PaymentFormModal from "./components/PaymentFormModal";
import AssetFormModal from "./components/AssetFormModal";
import SupplierFormModal from "./components/SupplierFormModal";
import ReceivableFormModal from "./components/ReceivableFormModal";
import PayableFormModal from "./components/PayableFormModal";
import FinanceKpiHeader from "./components/FinanceKpiHeader";
import PartialPaymentHistoryModal from "./components/PartialPaymentHistoryModal";
import AbonoModal from "./components/AbonoModal";

// TAB COMPONENTS
import DashboardTab from "./components/tabs/DashboardTab";
import ExpensesTab from "./components/tabs/ExpensesTab";
import PaymentsTab from "./components/tabs/PaymentsTab";
import ReceivablesTab from "./components/tabs/ReceivablesTab";
import PayablesTab from "./components/tabs/PayablesTab";

// OTHER TABS (existing components)
import AssetsList from "./components/AssetsList";
import SuppliersList from "./components/SuppliersList";
import BudgetsPanel from "./components/BudgetsPanel";
import IncomeStatement from "./components/IncomeStatement";
import BalanceSheet from "./components/BalanceSheet";
import GeneralLedger from "./components/GeneralLedger";
import TaxReports from "./components/TaxReports";
import ReportsPanel from "./components/ReportsPanel";

// UTILS
import { printReceivableReceipt } from "./utils/printReceipts";

export default function FinanceScreen({ orgSlug }) {
  const finance = useFinance(orgSlug);
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Payment history modal state
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState("receivables");

  // Quick payment (abono) modal state
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const [abonoReceivable, setAbonoReceivable] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState("");
  const [abonoSaving, setAbonoSaving] = useState(false);

  const openAbonoModal = (receivable) => {
    setAbonoReceivable(receivable);
    setAbonoAmount("");
    setAbonoModalOpen(true);
  };

  const closeAbonoModal = () => {
    setAbonoModalOpen(false);
    setAbonoReceivable(null);
    setAbonoAmount("");
  };

  const handleAbonoSubmit = async () => {
    if (!abonoReceivable || !abonoAmount) return;
    
    const amount = parseFloat(abonoAmount);
    const currentTotal = parseFloat(abonoReceivable.total) || 0;
    const currentPaid = parseFloat(abonoReceivable.amount_paid) || 0;
    const balance = currentTotal - currentPaid;
    
    if (amount <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }
    
    if (amount > balance) {
      alert(`El monto no puede ser mayor al saldo pendiente (C$ ${balance.toLocaleString("es-NI")})`);
      return;
    }
    
    setAbonoSaving(true);
    
    const newAmountPaid = currentPaid + amount;
    const newStatus = newAmountPaid >= currentTotal ? "paid" : "partial";
    
    const result = await finance.saveReceivable({
      id: abonoReceivable.id,
      client_id: abonoReceivable.client_id,
      factura: abonoReceivable.factura,
      fecha: abonoReceivable.fecha,
      total: currentTotal,
      amount_paid: newAmountPaid,
      due_date: abonoReceivable.due_date || null,
      status: newStatus,
      notes: abonoReceivable.notes || null,
    });
    
    setAbonoSaving(false);
    
    if (result?.success) {
      closeAbonoModal();
    } else {
      alert(result?.error || "Error al registrar abono");
    }
  };

  const openPaymentHistory = (item, type) => {
    setSelectedItem(item);
    setSelectedItemType(type);
    setHistoryModalOpen(true);
  };

  if (finance.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando datos financieros...</p>
      </div>
    );
  }

  if (finance.error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {finance.error}</p>
      </div>
    );
  }

  const tabs = [
    { id: "dashboard", label: "Resumen" },
    { id: "expenses", label: "Gastos" },
    { id: "payments", label: "Cobros/Pagos" },
    { id: "receivables", label: "Por Cobrar" },
    { id: "payables", label: "Por Pagar" },
    { id: "assets", label: "Activos Fijos" },
    { id: "suppliers", label: "Proveedores" },
    { id: "budgets", label: "Presupuestos" },
    { id: "income_statement", label: "Estado Resultados" },
    { id: "balance_sheet", label: "Balance General" },
    { id: "ledger", label: "Libro Diario" },
    { id: "taxes", label: "Impuestos" },
    { id: "reports", label: "Reportes" },
  ];

  const actionButtons = {
    expenses: { label: "+ Registrar Gasto", onClick: finance.openNewExpense, color: "bg-red-600 hover:bg-red-700" },
    payments: { label: "+ Registrar Pago/Cobro", onClick: finance.openNewPayment, color: "bg-emerald-600 hover:bg-emerald-700" },
    receivables: { label: "+ Nueva Cuenta por Cobrar", onClick: finance.openReceivableModal, color: "bg-blue-600 hover:bg-blue-700" },
    payables: { label: "+ Nueva Cuenta por Pagar", onClick: finance.openPayableModal, color: "bg-orange-600 hover:bg-orange-700" },
    assets: { label: "+ Agregar Activo", onClick: finance.openNewAsset, color: "bg-blue-600 hover:bg-blue-700" },
    suppliers: { label: "+ Agregar Proveedor", onClick: finance.openNewSupplier, color: "bg-slate-900 hover:bg-slate-800" },
  };

  const currentAction = actionButtons[activeTab];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Finanzas</h1>
          <p className="text-xs text-slate-500">Control de gastos, ingresos, activos y reportes financieros</p>
        </div>
        {currentAction && (
          <button onClick={currentAction.onClick} className={`px-3 py-2 text-white rounded-lg text-xs ${currentAction.color}`}>
            {currentAction.label}
          </button>
        )}
      </div>

      <FinanceKpiHeader stats={finance.stats} receivables={finance.receivables} payables={finance.payables} cashAccounts={finance.cashAccounts} />

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === "dashboard" && <DashboardTab finance={finance} />}
          {activeTab === "expenses" && <ExpensesTab finance={finance} />}
          {activeTab === "payments" && <PaymentsTab finance={finance} />}
          {activeTab === "receivables" && <ReceivablesTab finance={finance} onAbonar={openAbonoModal} onViewHistory={openPaymentHistory} onPrint={printReceivableReceipt} />}
          {activeTab === "payables" && <PayablesTab finance={finance} onViewHistory={openPaymentHistory} />}
          {activeTab === "assets" && <AssetsList assets={finance.assets} onEdit={finance.openEditAsset} onDelete={finance.deleteAsset} />}
          {activeTab === "suppliers" && <SuppliersList suppliers={finance.suppliers} onEdit={finance.openEditSupplier} onDelete={finance.deleteSupplier} />}
          {activeTab === "budgets" && <BudgetsPanel accounts={finance.accounts} expenses={finance.expenses} orgSlug={orgSlug} />}
          {activeTab === "income_statement" && <IncomeStatement payments={finance.payments} expenses={finance.expenses} sales={finance.sales} orgName="Agrocentro" />}
          {activeTab === "balance_sheet" && <BalanceSheet accounts={finance.accounts} assets={finance.assets} receivables={finance.receivables} payables={finance.payables} sales={finance.sales} expenses={finance.expenses} inventory={finance.inventory} orgName="Agrocentro" />}
          {activeTab === "ledger" && <GeneralLedger payments={finance.payments} expenses={finance.expenses} accounts={finance.accounts} orgName="Agrocentro" />}
          {activeTab === "taxes" && <TaxReports payments={finance.payments} expenses={finance.expenses} sales={finance.sales} orgName="Agrocentro" />}
          {activeTab === "reports" && <ReportsPanel orgSlug={orgSlug} accounts={finance.accounts} />}
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormModal isOpen={finance.expenseModalOpen} onClose={finance.closeExpenseModal} onSave={finance.saveExpense} expense={finance.editingExpense} suppliers={finance.suppliers} accounts={finance.expenseAccounts} />
      <PaymentFormModal isOpen={finance.paymentModalOpen} onClose={finance.closePaymentModal} onSave={finance.savePayment} payment={finance.editingPayment} clients={finance.clients} suppliers={finance.suppliers} cashAccounts={finance.cashAccounts} receivables={finance.receivables} payables={finance.payables} payingBill={finance.payingBill} />
      <AssetFormModal isOpen={finance.assetModalOpen} onClose={finance.closeAssetModal} onSave={finance.saveAsset} asset={finance.editingAsset} accounts={finance.assetAccounts} />
      <SupplierFormModal isOpen={finance.supplierModalOpen} onClose={finance.closeSupplierModal} onSave={finance.saveSupplier} supplier={finance.editingSupplier} />
      <ReceivableFormModal isOpen={finance.receivableModalOpen} onClose={finance.closeReceivableModal} onSave={finance.saveReceivable} receivable={finance.editingReceivable} clients={finance.clients} onCreateClient={finance.createClientInline} />
      <PayableFormModal isOpen={finance.payableModalOpen} onClose={finance.closePayableModal} onSave={finance.savePayable} payable={finance.editingPayable} suppliers={finance.suppliers} onCreateSupplier={finance.createSupplierInline} />
      <PartialPaymentHistoryModal isOpen={historyModalOpen} onClose={() => setHistoryModalOpen(false)} item={selectedItem} type={selectedItemType} orgSlug={orgSlug} />
      <AbonoModal isOpen={abonoModalOpen} receivable={abonoReceivable} amount={abonoAmount} onAmountChange={setAbonoAmount} onClose={closeAbonoModal} onSubmit={handleAbonoSubmit} saving={abonoSaving} />
    </div>
  );
}