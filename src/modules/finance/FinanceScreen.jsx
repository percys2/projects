"use client";

import React, { useState } from "react";
import { useFinance } from "./hooks/useFinance";
import FinanceStats from "./components/FinanceStats";
import ExpensesList from "./components/ExpensesList";
import PaymentsList from "./components/PaymentsList";
import AssetsList from "./components/AssetsList";
import SuppliersList from "./components/SuppliersList";
import ExpenseFormModal from "./components/ExpenseFormModal";
import PaymentFormModal from "./components/PaymentFormModal";
import AssetFormModal from "./components/AssetFormModal";
import SupplierFormModal from "./components/SupplierFormModal";
import ReportsPanel from "./components/ReportsPanel";
import ReceivableFormModal from "./components/ReceivableFormModal";
import PayableFormModal from "./components/PayableFormModal";

// NEW COMPONENTS
import CashFlowChart from "./components/CashFlowChart";
import FinanceKpiHeader from "./components/FinanceKpiHeader";
import DueDateAlerts from "./components/DueDateAlerts";
import PartialPaymentHistoryModal from "./components/PartialPaymentHistoryModal";
import BudgetsPanel from "./components/BudgetsPanel";
import FinanceExportButtons from "./components/FinanceExportButtons";

// ADVANCED FINANCE COMPONENTS
import IncomeStatement from "./components/IncomeStatement";
import BalanceSheet from "./components/BalanceSheet";
import GeneralLedger from "./components/GeneralLedger";
import TaxReports from "./components/TaxReports";

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
    
    // Build minimal payload with only required fields
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

    const printReceivableReceipt = (receivable) => {
      const balance = (receivable.total || 0) - (receivable.amount_paid || 0);
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Comprobante de Deuda - ${receivable.factura}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; padding: 20px; font-size: 12px; max-width: 400px; margin: 0 auto; }
              .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
              .header h1 { font-size: 16px; margin-bottom: 5px; }
              .header h2 { font-size: 14px; font-weight: normal; color: #555; }
              .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd; }
              .info-row .label { color: #666; }
              .info-row .value { font-weight: bold; }
              .total-section { margin-top: 15px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
              .balance { font-size: 18px; color: #dc2626; font-weight: bold; }
              .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #888; }
              .signature { margin-top: 50px; text-align: center; }
              .signature-line { border-top: 1px solid #333; width: 200px; margin: 0 auto; padding-top: 5px; }
              @media print { @page { margin: 10mm; size: 80mm auto; } }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>COMPROBANTE DE DEUDA</h1>
              <h2>Cuenta por Cobrar</h2>
            </div>
          
            <div class="info-row">
              <span class="label">Cliente:</span>
              <span class="value">${receivable.client_name || "Cliente"}</span>
            </div>
            <div class="info-row">
              <span class="label">Factura:</span>
              <span class="value">${receivable.factura || "-"}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span class="value">${receivable.fecha || "-"}</span>
            </div>
            <div class="info-row">
              <span class="label">Vencimiento:</span>
              <span class="value">${receivable.due_date || "Sin fecha"}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value">${receivable.status === "paid" ? "Pagado" : receivable.status === "partial" ? "Parcial" : "Pendiente"}</span>
            </div>
          
            <div class="total-section">
              <div class="total-row">
                <span>Total Factura:</span>
                <span>C$ ${(receivable.total || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row">
                <span>Monto Pagado:</span>
                <span>C$ ${(receivable.amount_paid || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="total-row" style="border-top: 1px solid #333; padding-top: 10px; margin-top: 10px;">
                <span style="font-size: 14px;">SALDO PENDIENTE:</span>
                <span class="balance">C$ ${balance.toLocaleString("es-NI", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          
            <div class="signature">
              <div class="signature-line">Firma del Cliente</div>
            </div>
          
            <div class="footer">
              <p>Documento generado el ${new Date().toLocaleDateString("es-NI")} a las ${new Date().toLocaleTimeString("es-NI")}</p>
              <p>Este documento es un comprobante de deuda pendiente</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
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

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Finanzas</h1>
          <p className="text-xs text-slate-500">
            Control de gastos, ingresos, activos y reportes financieros
          </p>
        </div>

        <div className="flex gap-2">
          {activeTab === "expenses" && (
            <button
              onClick={finance.openNewExpense}
              className="px-3 py-2 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
            >
              + Registrar Gasto
            </button>
          )}
          {activeTab === "payments" && (
            <button
              onClick={finance.openNewPayment}
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
            >
              + Registrar Pago/Cobro
            </button>
          )}
          {activeTab === "receivables" && (
            <button
              onClick={finance.openReceivableModal}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
            >
              + Nueva Cuenta por Cobrar
            </button>
          )}
          {activeTab === "payables" && (
            <button
              onClick={finance.openPayableModal}
              className="px-3 py-2 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700"
            >
              + Nueva Cuenta por Pagar
            </button>
          )}
          {activeTab === "assets" && (
            <button
              onClick={finance.openNewAsset}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700"
            >
              + Agregar Activo
            </button>
          )}
          {activeTab === "suppliers" && (
            <button
              onClick={finance.openNewSupplier}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
            >
              + Agregar Proveedor
            </button>
          )}
        </div>
      </div>

      {/* KPI Header - Always visible */}
      <FinanceKpiHeader 
        stats={finance.stats} 
        receivables={finance.receivables}
        payables={finance.payables}
        cashAccounts={finance.cashAccounts}
      />

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="border-b overflow-x-auto">
          <nav className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-b-2 border-slate-900 text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Cash Flow Chart */}
              <div className="bg-slate-50 rounded-lg p-4 border">
                <h3 className="font-medium text-slate-700 mb-4">Flujo de Caja (Últimos 6 meses)</h3>
               <CashFlowChart payments={finance.payments} />
              </div>

              <h3 className="font-medium text-slate-700">Movimientos Recientes</h3>
              <PaymentsList
                payments={finance.recentPayments}
                onEdit={finance.openEditPayment}
                onDelete={finance.deletePayment}
                compact
              />
            </div>
          )}

          {activeTab === "expenses" && (
            <div>
              <div className="flex justify-end mb-4">
                <FinanceExportButtons 
                  data={finance.expenses} 
                  type="expenses" 
                  title="Gastos" 
                />
              </div>
              <ExpensesList
                expenses={finance.expenses}
                onEdit={finance.openEditExpense}
                onDelete={finance.deleteExpense}
              />
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <div className="flex justify-end mb-4">
                <FinanceExportButtons 
                  data={finance.payments} 
                  type="payments" 
                  title="Pagos y Cobros" 
                />
              </div>
              <PaymentsList
                payments={finance.payments}
                onEdit={finance.openEditPayment}
                onDelete={finance.deletePayment}
              />
            </div>
          )}

                    {activeTab === "receivables" && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-slate-700">Cuentas por Cobrar</h3>
                          <FinanceExportButtons 
                            data={finance.receivables} 
                            type="receivables" 
                            title="Cuentas por Cobrar" 
                          />
                        </div>
              
                        <DueDateAlerts items={finance.receivables} type="receivables" />
              
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                                <th className="px-3 py-2 text-left">Cliente</th>
                                <th className="px-3 py-2 text-left">Factura</th>
                                <th className="px-3 py-2 text-left">Fecha</th>
                                <th className="px-3 py-2 text-left">Vence</th>
                                <th className="px-3 py-2 text-right">Total</th>
                                <th className="px-3 py-2 text-right">Pagado</th>
                                <th className="px-3 py-2 text-right">Saldo</th>
                                <th className="px-3 py-2 text-left">Estado</th>
                                <th className="px-3 py-2 text-center">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {finance.receivables.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                                    No hay cuentas por cobrar pendientes
                                  </td>
                                </tr>
                              ) : (
                                finance.receivables.map((r) => (
                                  <tr key={r.id} className="border-b hover:bg-slate-50">
                                    <td className="px-3 py-2">{r.client_name || "Cliente"}</td>
                                    <td className="px-3 py-2">{r.factura}</td>
                                    <td className="px-3 py-2">{r.fecha}</td>
                                    <td className="px-3 py-2">{r.due_date || "-"}</td>
                                    <td className="px-3 py-2 text-right">C$ {r.total?.toLocaleString("es-NI")}</td>
                                    <td className="px-3 py-2 text-right">C$ {(r.amount_paid || 0).toLocaleString("es-NI")}</td>
                                    <td className="px-3 py-2 text-right font-medium text-red-600">
                                      C$ {((r.total || 0) - (r.amount_paid || 0)).toLocaleString("es-NI")}
                                    </td>
                                    <td className="px-3 py-2">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        r.status === "paid" ? "bg-green-100 text-green-700" :
                                        r.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                                        "bg-red-100 text-red-700"
                                      }`}>
                                        {r.status === "paid" ? "Pagado" : r.status === "partial" ? "Parcial" : "Pendiente"}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <div className="flex gap-1 justify-center flex-wrap">
                                        {r.status !== "paid" && (
                                          <button
                                            onClick={() => openAbonoModal(r)}
                                            className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                          >
                                            Abonar
                                          </button>
                                        )}
                                        <button
                                          onClick={() => openPaymentHistory(r, "receivables")}
                                          className="text-blue-600 hover:underline text-xs"
                                        >
                                          Historial
                                        </button>
                                        <button
                                          onClick={() => printReceivableReceipt(r)}
                                          className="text-emerald-600 hover:underline text-xs"
                                        >
                                          Imprimir
                                        </button>
                                        <button
                                          onClick={() => finance.deleteReceivable(r.id)}
                                          className="text-red-600 hover:underline text-xs"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

          {activeTab === "payables" && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-slate-700">Cuentas por Pagar</h3>
                <FinanceExportButtons 
                  data={finance.payables} 
                  type="payables" 
                  title="Cuentas por Pagar" 
                />
              </div>
              
              <DueDateAlerts items={finance.payables} type="payables" />
              
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                      <th className="px-3 py-2 text-left">Proveedor</th>
                      <th className="px-3 py-2 text-left">Referencia</th>
                      <th className="px-3 py-2 text-left">Fecha</th>
                      <th className="px-3 py-2 text-left">Vence</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-right">Pagado</th>
                      <th className="px-3 py-2 text-right">Saldo</th>
                      <th className="px-3 py-2 text-left">Estado</th>
                      <th className="px-3 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finance.payables.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                          No hay cuentas por pagar pendientes
                        </td>
                      </tr>
                    ) : (
                      finance.payables.map((p) => (
                        <tr key={p.id} className="border-b hover:bg-slate-50">
                          <td className="px-3 py-2">{p.supplier_name || "Proveedor"}</td>
                          <td className="px-3 py-2">{p.reference}</td>
                          <td className="px-3 py-2">{p.date}</td>
                          <td className="px-3 py-2">{p.due_date || "-"}</td>
                          <td className="px-3 py-2 text-right">C$ {p.total?.toLocaleString("es-NI")}</td>
                          <td className="px-3 py-2 text-right">C$ {(p.amount_paid || 0).toLocaleString("es-NI")}</td>
                          <td className="px-3 py-2 text-right font-medium text-red-600">
                            C$ {((p.total || 0) - (p.amount_paid || 0)).toLocaleString("es-NI")}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              p.status === "paid" ? "bg-green-100 text-green-700" :
                              p.status === "partial" ? "bg-yellow-100 text-yellow-700" :
                              "bg-red-100 text-red-700"
                            }`}>
                              {p.status === "paid" ? "Pagado" : p.status === "partial" ? "Parcial" : "Pendiente"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => finance.openPayBill(p)}
                                className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                disabled={p.status === "paid"}
                              >
                                Pagar
                              </button>
                              <button
                                onClick={() => openPaymentHistory(p, "payables")}
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Historial
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "assets" && (
            <AssetsList
              assets={finance.assets}
              onEdit={finance.openEditAsset}
              onDelete={finance.deleteAsset}
            />
          )}

          {activeTab === "suppliers" && (
            <SuppliersList
              suppliers={finance.suppliers}
              onEdit={finance.openEditSupplier}
              onDelete={finance.deleteSupplier}
            />
          )}

                    {activeTab === "budgets" && (
                      <BudgetsPanel
                        accounts={finance.accounts}
                        expenses={finance.expenses}
                        orgSlug={orgSlug}
                      />
                    )}

                                        {activeTab === "income_statement" && (
                                          <IncomeStatement
                                            payments={finance.payments}
                                            expenses={finance.expenses}
                                            sales={finance.sales}
                                            orgName="Mi Empresa"
                                          />
                                        )}

                                        {activeTab === "balance_sheet" && (
                                          <BalanceSheet
                                            accounts={finance.accounts}
                                            assets={finance.assets}
                                            receivables={finance.receivables}
                                            payables={finance.payables}
                                            sales={finance.sales}
                                            expenses={finance.expenses}
                                            orgName="Mi Empresa"
                                          />
                                        )}

                                        {activeTab === "ledger" && (
                                          <GeneralLedger
                                            payments={finance.payments}
                                            expenses={finance.expenses}
                                            accounts={finance.accounts}
                                            orgName="Mi Empresa"
                                          />
                                        )}

                                        {activeTab === "taxes" && (
                                          <TaxReports
                                            payments={finance.payments}
                                            expenses={finance.expenses}
                                            sales={finance.sales}
                                            orgName="Mi Empresa"
                                          />
                                        )}

                    {activeTab === "reports" && (
            <ReportsPanel
              orgSlug={orgSlug}
              accounts={finance.accounts}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      <ExpenseFormModal
        isOpen={finance.expenseModalOpen}
        onClose={finance.closeExpenseModal}
        onSave={finance.saveExpense}
        expense={finance.editingExpense}
        suppliers={finance.suppliers}
        accounts={finance.expenseAccounts}
      />

      <PaymentFormModal
        isOpen={finance.paymentModalOpen}
        onClose={finance.closePaymentModal}
        onSave={finance.savePayment}
        payment={finance.editingPayment}
        clients={finance.clients}
        suppliers={finance.suppliers}
        cashAccounts={finance.cashAccounts}
        receivables={finance.receivables}
        payables={finance.payables}
        payingBill={finance.payingBill}
      />

      <AssetFormModal
        isOpen={finance.assetModalOpen}
        onClose={finance.closeAssetModal}
        onSave={finance.saveAsset}
        asset={finance.editingAsset}
        accounts={finance.assetAccounts}
      />

      <SupplierFormModal
        isOpen={finance.supplierModalOpen}
        onClose={finance.closeSupplierModal}
        onSave={finance.saveSupplier}
        supplier={finance.editingSupplier}
      />

      <ReceivableFormModal
        isOpen={finance.receivableModalOpen}
        onClose={finance.closeReceivableModal}
        onSave={finance.saveReceivable}
        receivable={finance.editingReceivable}
        clients={finance.clients}
        onCreateClient={finance.createClientInline}
      />

      <PayableFormModal
        isOpen={finance.payableModalOpen}
        onClose={finance.closePayableModal}
        onSave={finance.savePayable}
        payable={finance.editingPayable}
        suppliers={finance.suppliers}
        onCreateSupplier={finance.createSupplierInline}
      />

      <PartialPaymentHistoryModal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        item={selectedItem}
        type={selectedItemType}
        orgSlug={orgSlug}
      />

      {/* Abono Modal */}
      {abonoModalOpen && abonoReceivable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
            <div className="px-4 py-3 border-b flex justify-between items-center">
              <h2 className="font-semibold text-slate-800">Registrar Abono</h2>
              <button onClick={closeAbonoModal} className="text-slate-400 hover:text-slate-600 text-xl">
                &times;
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cliente:</span>
                  <span className="font-medium">{abonoReceivable.client_name || "Cliente"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Factura:</span>
                  <span className="font-medium">{abonoReceivable.factura}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total:</span>
                  <span className="font-medium">C$ {(abonoReceivable.total || 0).toLocaleString("es-NI")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Pagado:</span>
                  <span className="font-medium">C$ {(abonoReceivable.amount_paid || 0).toLocaleString("es-NI")}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-slate-700 font-medium">Saldo Pendiente:</span>
                  <span className="font-bold text-red-600">
                    C$ {((abonoReceivable.total || 0) - (abonoReceivable.amount_paid || 0)).toLocaleString("es-NI")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Monto del Abono *
                </label>
                <input
                  type="number"
                  value={abonoAmount}
                  onChange={(e) => setAbonoAmount(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max={(abonoReceivable.total || 0) - (abonoReceivable.amount_paid || 0)}
                  autoFocus
                />
              </div>

              {abonoAmount && parseFloat(abonoAmount) > 0 && (
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-700">Nuevo saldo despues del abono:</span>
                    <span className="font-bold text-emerald-700">
                      C$ {(((abonoReceivable.total || 0) - (abonoReceivable.amount_paid || 0)) - parseFloat(abonoAmount)).toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={closeAbonoModal}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAbonoSubmit}
                  disabled={abonoSaving || !abonoAmount || parseFloat(abonoAmount) <= 0}
                  className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
                >
                  {abonoSaving ? "Guardando..." : "Registrar Abono"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}