"use client";

import CashFlowChart from "../CashFlowChart";
import PaymentsList from "../PaymentsList";

export default function DashboardTab({ finance }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 rounded-lg p-4 border">
        <h3 className="font-medium text-slate-700 mb-4">Flujo de Caja (Últimos 12 meses)</h3>
        <CashFlowChart payments={finance.payments} sales={finance.sales} />
      </div>

      <h3 className="font-medium text-slate-700">Movimientos Recientes</h3>
      <PaymentsList
        payments={finance.recentPayments}
        onEdit={finance.openEditPayment}
        onDelete={finance.deletePayment}
        compact
      />
    </div>
  );
}
