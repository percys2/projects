export function printReceivableReceipt(receivable) {
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
}
