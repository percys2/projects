"use client";

import { FileSpreadsheet, FileText, Printer } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export default function FinanceExportButtons({ data, type, title }) {
  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    let sheetData = [];
    const headers = getHeaders(type);
    sheetData.push(headers);

    data.forEach((item) => {
      sheetData.push(getRowData(item, type));
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = headers.map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title || type);

    XLSX.writeFile(wb, `${type}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    if (!data || data.length === 0) {
      alert("No hay datos para exportar");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.text(title || type, pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Generado: ${new Date().toLocaleDateString("es-NI")}`, pageWidth / 2, 28, { align: "center" });

    const headers = getHeaders(type);
    const tableData = data.map((item) => getRowData(item, type));

    autoTable(doc, {
      startY: 35,
      head: [headers],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`${type}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={exportToExcel}
        className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700"
        title="Exportar a Excel"
      >
        <FileSpreadsheet className="w-3 h-3" />
        Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700"
        title="Exportar a PDF"
      >
        <FileText className="w-3 h-3" />
        PDF
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 text-white rounded text-xs hover:bg-slate-700"
        title="Imprimir"
      >
        <Printer className="w-3 h-3" />
        Imprimir
      </button>
    </div>
  );
}

function getHeaders(type) {
  switch (type) {
    case "receivables":
      return ["Cliente", "Factura", "Fecha", "Vence", "Total", "Pagado", "Saldo", "Estado"];
    case "payables":
      return ["Proveedor", "Referencia", "Fecha", "Vence", "Total", "Pagado", "Saldo", "Estado"];
    case "expenses":
      return ["Fecha", "Descripción", "Proveedor", "Total", "Estado"];
    case "payments":
      return ["Fecha", "Descripción", "Tipo", "Monto", "Método"];
    default:
      return ["Columna 1", "Columna 2", "Columna 3"];
  }
}

function getRowData(item, type) {
  switch (type) {
    case "receivables":
      return [
        item.client_name || "-",
        item.factura || "-",
        item.fecha || "-",
        item.due_date || "-",
        item.total || 0,
        item.amount_paid || 0,
        (item.total || 0) - (item.amount_paid || 0),
        item.status === "paid" ? "Pagado" : item.status === "partial" ? "Parcial" : "Pendiente",
      ];
    case "payables":
      return [
        item.supplier_name || "-",
        item.reference || "-",
        item.date || "-",
        item.due_date || "-",
        item.total || 0,
        item.amount_paid || 0,
        (item.total || 0) - (item.amount_paid || 0),
        item.status === "paid" ? "Pagado" : item.status === "partial" ? "Parcial" : "Pendiente",
      ];
    case "expenses":
      return [
        item.date || "-",
        item.description || "-",
        item.supplier_name || "-",
        item.total || 0,
        item.status || "-",
      ];
    case "payments":
      return [
        item.date || "-",
        item.description || "-",
        item.direction === "in" ? "Cobro" : "Pago",
        item.amount || 0,
        item.payment_method || "Efectivo",
      ];
    default:
      return Object.values(item).slice(0, 3);
  }
}
