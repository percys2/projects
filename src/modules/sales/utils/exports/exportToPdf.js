import { formatCurrency, formatDate } from "../formatters";
import { getClientName, getBranchName, getProductNames } from "../salePresenters";

export const exportSalesToPdf = async ({ sales, totals, filters, branches }) => {
  if (sales.length === 0) {
    alert("No hay ventas para exportar");
    return;
  }

  const jsPDF = (await import("jspdf")).default;
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFontSize(18);
  doc.text("Reporte de Ventas", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  const branchName = filters.selectedBranch 
    ? branches.find(b => b.id === filters.selectedBranch)?.name 
    : null;
  const periodText = filters.dateStart && filters.dateEnd 
    ? `Periodo: ${formatDate(filters.dateStart)} - ${formatDate(filters.dateEnd)}`
    : "Todas las ventas";
  doc.text(periodText, pageWidth / 2, 28, { align: "center" });
  
  if (branchName) {
    doc.text(`Sucursal: ${branchName}`, pageWidth / 2, 34, { align: "center" });
    doc.text(`Generado: ${new Date().toLocaleDateString("es-NI")}`, pageWidth / 2, 40, { align: "center" });
  } else {
    doc.text(`Generado: ${new Date().toLocaleDateString("es-NI")}`, pageWidth / 2, 34, { align: "center" });
  }

  const startY = branchName ? 50 : 44;
  doc.setFontSize(9);
  doc.text(`Total Ventas: ${formatCurrency(totals.totalRevenue)}`, 14, startY);
  doc.text(`Ganancia Bruta: ${formatCurrency(totals.totalMargin)}`, 14, startY + 6);
  doc.text(`Costo Total: ${formatCurrency(totals.totalCost)}`, 100, startY);
  doc.text(`Productos Vendidos: ${totals.totalItems}`, 100, startY + 6);

  const tableData = sales.map((sale) => [
    formatDate(sale.fecha),
    sale.factura || "-",
    getClientName(sale),
    getProductNames(sale, 3),
    getBranchName(sale, branches),
    formatCurrency(sale.total),
    formatCurrency(sale.margen),
  ]);

  autoTable(doc, {
    startY: startY + 14,
    head: [["Fecha", "Factura", "Cliente", "Productos", "Sucursal", "Total", "Margen"]],
    body: tableData,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [51, 65, 85], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 45 },
      4: { cellWidth: 22 },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 22, halign: "right" },
    },
  });

  const fileName = filters.dateStart && filters.dateEnd 
    ? `ventas_${filters.dateStart}_${filters.dateEnd}.pdf`
    : `ventas_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};