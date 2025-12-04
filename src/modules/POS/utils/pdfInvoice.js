import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates a professional A4 PDF invoice.
 * Used after sale is completed.
 */

export async function generatePDFInvoice(sale) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const pageWidth = doc.internal.pageSize.getWidth();

  /* ===============================
       HEADER (LOGO + COMPANY DATA)
  =============================== */
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AGROCENTRO NICA", pageWidth / 2, 60, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.text("RUC: 401-010200-1002D", pageWidth / 2, 80, { align: "center" });
  doc.text("Masatepe, Masaya – Nicaragua", pageWidth / 2, 100, {
    align: "center",
  });

  doc.setLineWidth(1);
  doc.line(40, 120, pageWidth - 40, 120);

  /* ===============================
               SALE INFO
  =============================== */
  const yStart = 150;

  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");
  doc.text("Factura:", 40, yStart);
  doc.text("Fecha:", 40, yStart + 20);
  doc.text("Cliente:", 40, yStart + 40);

  doc.setFont("Helvetica", "normal");
  doc.text(`#${sale.invoice}`, 120, yStart);
  doc.text(sale.date, 120, yStart + 20);
  doc.text(sale.client_name, 120, yStart + 40);

  // Customer RUC if exists
  if (sale.client_ruc) {
    doc.text("RUC:", 40, yStart + 60);
    doc.text(sale.client_ruc, 120, yStart + 60);
  }

  doc.line(40, yStart + 80, pageWidth - 40, yStart + 80);

  /* ===============================
             ITEMS TABLE
  =============================== */

  const tableData = sale.items.map((item) => [
    item.qty,
    item.name,
    item.price.toFixed(2),
    (item.qty * item.price).toFixed(2),
  ]);

  autoTable(doc, {
    startY: yStart + 95,
    head: [["Cant.", "Producto", "Precio", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 240 },
      2: { cellWidth: 100 },
      3: { cellWidth: 100 },
    },
  });

  const tableY = doc.lastAutoTable.finalY;

  /* ===============================
                TOTALS
  =============================== */
  doc.setFontSize(12);
  doc.setFont("Helvetica", "bold");

  doc.text("Subtotal:", pageWidth - 200, tableY + 40);
  doc.text("IVA (15%):", pageWidth - 200, tableY + 60);
  doc.text("TOTAL:", pageWidth - 200, tableY + 80);

  doc.setFont("Helvetica", "normal");

  doc.text(`${sale.subtotal.toFixed(2)} C$`, pageWidth - 100, tableY + 40, {
    align: "right",
  });
  doc.text(`${sale.tax.toFixed(2)} C$`, pageWidth - 100, tableY + 60, {
    align: "right",
  });
  doc.text(`${sale.total.toFixed(2)} C$`, pageWidth - 100, tableY + 80, {
    align: "right",
  });

  /* ===============================
                QR CODE
  =============================== */
  if (sale.pdfUrl) {
    const qrImage = await fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${sale.pdfUrl}`
    ).then((res) => res.blob());

    const qrBase64 = await blobToBase64(qrImage);

    doc.addImage(qrBase64, "PNG", 40, tableY + 120, 120, 120);

    doc.setFontSize(10);
    doc.text("Escanee para ver factura digital", 40, tableY + 250);
  }

  /* ===============================
                FOOTER
  =============================== */
  doc.setFontSize(10);
  doc.setFont("Helvetica", "italic");
  doc.text(
    "Gracias por su compra - AGROCENTRO NICA",
    pageWidth / 2,
    pageWidth - 30,
    { align: "center" }
  );

  /* ===============================
         EXPORT / DOWNLOAD
  =============================== */
  const pdfBlob = doc.output("blob");

  const fileName = `Factura-${sale.invoice}.pdf`;
  const url = URL.createObjectURL(pdfBlob);

  // Auto download
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  return { blob: pdfBlob, url };
}

/* Helper: blob → base64 */
function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}
