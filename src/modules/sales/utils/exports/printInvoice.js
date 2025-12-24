import { formatCurrency, formatDate } from "../formatters";
import { getClientName, getBranchName } from "../salePresenters";

export const printSaleInvoice = async (sale, branches = []) => {
  const jsPDF = (await import("jspdf")).default;
  const { default: autoTable } = await import("jspdf-autotable");
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("FACTURA", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(12);
  doc.text(`No. ${sale.factura || sale.id}`, pageWidth / 2, 28, { align: "center" });

  doc.setFontSize(10);
  doc.text(`Fecha: ${formatDate(sale.fecha)}`, 14, 45);
  doc.text(`Cliente: ${getClientName(sale)}`, 14, 52);
  if (sale.clients?.phone) doc.text(`Tel: ${sale.clients.phone}`, 14, 59);
  
  const saleBranchName = getBranchName(sale, branches);
  if (saleBranchName !== "-") doc.text(`Sucursal: ${saleBranchName}`, 14, 66);

  const tableStartY = saleBranchName !== "-" ? 76 : 70;
  const tableData = (sale.sales_items || []).map((item) => [
    item.products?.name || "Producto",
    item.quantity,
    formatCurrency(item.price),
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [["Producto", "Cant.", "Precio", "Subtotal"]],
    body: tableData,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 35, halign: "right" },
    },
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, pageWidth - 14, finalY, { align: "right" });
  if (Number(sale.descuento) > 0) {
    doc.text(`Descuento: -${formatCurrency(sale.descuento)}`, pageWidth - 14, finalY + 6, { align: "right" });
  }
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text(`TOTAL: ${formatCurrency(sale.total)}`, pageWidth - 14, finalY + 14, { align: "right" });

  doc.setFontSize(8);
  doc.setFont(undefined, "normal");
  doc.text("Gracias por su compra", pageWidth / 2, finalY + 30, { align: "center" });

  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
};