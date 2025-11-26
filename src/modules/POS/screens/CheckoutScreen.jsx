"use client";

import React, { useState } from "react";
import { usePosStore } from "../store/usePosStore";
import CustomerSelector from "../components/CustomerSelector";
import PaymentMethods from "../components/PaymentMethods";
import TotalsBox from "../components/TotalsBox";
import InvoicePreview from "../components/InvoicePreview";

import { salesService } from "../services/salesService";
import { printService } from "../utils/printService";
import { generatePDFInvoice } from "../utils/pdfInvoice";
import { calculateTotals } from "../utils/calculateTotals";

export default function CheckoutScreen() {
  const cart = usePosStore((s) => s.cart);
  const selectedClient = usePosStore((s) => s.selectedClient);
  const clearCart = usePosStore((s) => s.clearCart);

  const [processing, setProcessing] = useState(false);

  async function finishSale(confirmData) {
    if (!selectedClient) {
      alert("Seleccione un cliente antes de finalizar la venta.");
      return;
    }

    if (cart.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    try {
      setProcessing(true);

      const totals = calculateTotals(cart);
      const now = new Date();

      /* ==========================================
          1. Registrar la venta vía salesService
      =========================================== */
      const sale = await salesService.makeSale({
        orgSlug: "masatepe", // luego dinámico según ERP
        orgId: "masatepe",
        client: selectedClient,
        cart,
        paymentType: confirmData.paymentMethod,
        branch: "Masatepe",
        branchId: "masatepe",
      });

      /* ==========================================
          2. Preparar DATA FORMATEADA para impresión
      =========================================== */
      const saleData = {
        invoice: sale.invoice,
        date: now.toLocaleString(),
        client_name: selectedClient.name,
        client_ruc: selectedClient.ruc || "",
        items: cart.map((p) => ({
          name: p.name,
          qty: p.qty,
          price: p.price,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        total: totals.total,
      };

      /* ==========================================
          3. IMPRIMIR TICKET
      =========================================== */
      await printService.printTicket(saleData);

      /* ==========================================
          4. Generar PDF A4
      =========================================== */
      const pdf = await generatePDFInvoice(saleData);

      // Para WhatsApp enviamos pdf.url
      const pdfUrl = pdf.url;

      /* ==========================================
          5. ENVIAR POR WHATSAPP
      =========================================== */
      if (selectedClient.phone) {
        const phone = selectedClient.phone.replace(/\D/g, "");
        const msg = encodeURIComponent(
          `Hola ${selectedClient.name}, gracias por su compra en AGROCENTRO NICA.\n\nAquí está su factura:\n${pdfUrl}`
        );

        window.open(`https://wa.me/505${phone}?text=${msg}`, "_blank");
      }

      /* ==========================================
          6. LIMPIAR CARRITO
      =========================================== */
      clearCart();

      alert("Venta completada con éxito.");

      return sale.id;
    } catch (err) {
      console.error(err);
      alert("Error al procesar la venta: " + err.message);
    } finally {
      setProcessing(false);
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
        <TotalsBox onFinish={finishSale} />
        <InvoicePreview />
      </div>
    </div>
  );
}
