// ================================
//  exportKardexPDF.js (COMPLETO)
//  Kardex ERP – Sin errores
// ================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function exportKardexPDF({
  org,
  product,
  branch,
  movements,
  dateStart,
  dateEnd,
  userName = "Sistema",
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "A4",
  });

  // =======================================
  //  ENCABEZADO DE EMPRESA
  // =======================================
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text(org?.name?.toUpperCase() || "EMPRESA", 40, 40);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  if (org?.ruc) doc.text(`RUC: ${org.ruc}`, 40, 60);
  if (org?.address) doc.text(`Dirección: ${org.address}`, 40, 75);
  if (org?.phone) doc.text(`Tel: ${org.phone}`, 40, 90);

  // LOGO (opcional)
  if (org?.logo_url) {
    try {
      doc.addImage(org.logo_url, "PNG", 400, 25, 140, 60);
    } catch (err) {
      console.log("Error agregando logo:", err);
    }
  }

  // =======================================
  //  INFORMACIÓN GENERAL DEL REPORTE
  // =======================================
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("REPORTE DE KARDEX", 40, 130);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Fecha generación: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: es })}`,
    40,
    150
  );

  if (product)
    doc.text(`Producto: ${product.name}`, 40, 165);

  if (branch)
    doc.text(`Sucursal: ${branch.name}`, 40, 180);

  if (dateStart && dateEnd)
    doc.text(`Rango: ${dateStart} → ${dateEnd}`, 40, 195);

  doc.text(`Generado por: ${userName}`, 40, 210);

  // =======================================
  // TABLA – FORMATEO SEGURO
  // =======================================
  const tableData = movements.map((m) => [
    // Fecha
    format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: es }),

    // Movimiento (FIX: evita crash)
    String(m.movement_type || m.type || "N/A").toUpperCase(),

    // Cantidad
    m.qty ?? 0,

    // Costo Unitario
    `C$ ${Number(m.cost_unit || 0).toFixed(2)}`,

    // Costo Total
    `C$ ${Number(m.total_cost || 0).toFixed(2)}`,

    // Sucursales
    m.from_branch || "-",
    m.to_branch || "-",

    // Referencia
    m.reference || "-",

    // Usuario
    m.user?.full_name || m.user?.email || "-",
  ]);

  autoTable(doc, {
    startY: 230,
    head: [
      [
        "Fecha",
        "Movimiento",
        "Cantidad",
        "Costo U.",
        "Total",
        "Origen",
        "Destino",
        "Referencia",
        "Usuario",
      ],
    ],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 41, 59], // slate-900
      textColor: [255, 255, 255],
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // =======================================
  // TOTALES – Cálculo robusto
  // =======================================
  const totals = movements.reduce(
    (acc, m) => {
      const qty = Number(m.qty || 0);
      const totalCost = Number(m.total_cost || 0);

      const type = m.movement_type || m.type;

      if (type === "entrada") {
        acc.entradas += qty;
        acc.costoEntradas += totalCost;
      }
      if (type === "salida") {
        acc.salidas += qty;
        acc.costoSalidas += totalCost;
      }

      return acc;
    },
    {
      entradas: 0,
      salidas: 0,
      costoEntradas: 0,
      costoSalidas: 0,
    }
  );

  const finalY = doc.lastAutoTable.finalY + 30;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Totales del periodo:", 40, finalY);

  doc.setFont("Helvetica", "normal");
  doc.text(`Entradas: ${totals.entradas}`, 40, finalY + 20);
  doc.text(`Salidas: ${totals.salidas}`, 40, finalY + 40);
  doc.text(
    `Balance: ${totals.entradas - totals.salidas}`,
    40,
    finalY + 60
  );

  doc.text(
    `Costo total entradas: C$ ${totals.costoEntradas.toFixed(2)}`,
    250,
    finalY + 20
  );

  doc.text(
    `Costo total salidas: C$ ${totals.costoSalidas.toFixed(2)}`,
    250,
    finalY + 40
  );

  // =======================================
  // GUARDAR PDF
  // =======================================
  doc.save(
    `Kardex_${product?.name || "todos"}_${format(new Date(), "yyyyMMdd")}.pdf`
  );
}
