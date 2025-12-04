"use client";

import React, { useState } from "react";
import { useFinance } from "./hooks/useFinance";
import FinanceStats from "./components/FinanceStats";
import AccountsList from "./components/AccountsList";
import ExpensesList from "./components/ExpensesList";
import PaymentsList from "./components/PaymentsList";
import AssetsList from "./components/AssetsList";
import SuppliersList from "./components/SuppliersList";
import AccountFormModal from "./components/AccountFormModal";
import ExpenseFormModal from "./components/ExpenseFormModal";
import PaymentFormModal from "./components/PaymentFormModal";
import AssetFormModal from "./components/AssetFormModal";
import SupplierFormModal from "./components/SupplierFormModal";
import ReportsPanel from "./components/ReportsPanel";

export default function FinanceScreen({ orgSlug }) {
  const finance = useFinance(orgSlug);
  const [activeTab, setActiveTab] = useState("dashboard");

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
    { id: "accounts", label: "Plan de Cuentas" },
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
          {activeTab === "accounts" && (
            <button
              onClick={finance.openNewAccount}
              className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
            >
              + Nueva Cuenta
            </button>
          )}
        </div>
      </div>

      <FinanceStats stats={finance.stats} />

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
            <div className="space-y-4">
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
            <ExpensesList
              expenses={finance.expenses}
              onEdit={finance.openEditExpense}
              onDelete={finance.deleteExpense}
            />
          )}

          {activeTab === "payments" && (
            <PaymentsList
              payments={finance.payments}
              onEdit={finance.openEditPayment}
              onDelete={finance.deletePayment}
            />
          )}

          {activeTab === "receivables" && (
            <div className="space-y-4">
              <h3 className="font-medium text-slate-700">Cuentas por Cobrar</h3>
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
                    </tr>
                  </thead>
                  <tbody>
                    {finance.receivables.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-3 py-8 text-center text-slate-400">
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
              <h3 className="font-medium text-slate-700">Cuentas por Pagar</h3>
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
                            <button
                              onClick={() => finance.openPayBill(p)}
                              className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                              disabled={p.status === "paid"}
                            >
                              Pagar
                            </button>
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

          {activeTab === "accounts" && (
            <AccountsList
              accounts={finance.accounts}
              onEdit={finance.openEditAccount}
              onDelete={finance.deleteAccount}
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

      <AccountFormModal
        isOpen={finance.accountModalOpen}
        onClose={finance.closeAccountModal}
        onSave={finance.saveAccount}
        account={finance.editingAccount}
        accounts={finance.accounts}
      />

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
    </div>
  );
}
