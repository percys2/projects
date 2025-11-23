"use client";

import React from "react";
import { usePosStore } from "../store/usePosStore";
import CustomerSelector from "../components/CustomerSelector";
import PaymentMethods from "../components/PaymentMethods";
import TotalsBox from "../components/TotalsBox";
import InvoicePreview from "../components/InvoicePreview";

export default function CheckoutScreen() {
  const checkout = usePosStore((s) => s.checkout);

  async function handleFinishSale() {
    try {
      const saleId = await checkout();
      alert("Venta completada! Factura: " + saleId);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* LEFT */}
      <div className="col-span-8 space-y-4">
        <CustomerSelector />
        <PaymentMethods />
      </div>

      {/* RIGHT */}
      <div className="col-span-4 space-y-4">
        <TotalsBox onFinish={handleFinishSale} />
        <InvoicePreview />
      </div>
    </div>
  );
}
