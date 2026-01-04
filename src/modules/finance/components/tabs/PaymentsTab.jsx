"use client";

import FinanceExportButtons from "../FinanceExportButtons";
import PaymentsList from "../PaymentsList";

export default function PaymentsTab({ finance }) {
  return (
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
  );
}