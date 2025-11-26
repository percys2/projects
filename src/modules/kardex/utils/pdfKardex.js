import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateKardexPDF({
  org,
  product,
  movements
}) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });

  // ============================
  // ENCABEZADO
  // ============================
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text(org.name.toUpperCase(), 40, 40);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`RUC: ${org.ruc}`, 40, 60);
  doc.text(`Dirección: ${org.address || "No registrada"}`, 40, 75);
  doc.text(`Teléfono: ${org.phone || "-"}`, 40, 90);

  // LOGO (si existe)
  if (org.logo_url) {
    const img = new Image();
    img.src = org.logo_url;
    doc.addImage(img, "PNG", 430, 20, 100, 100);
  }

  // LÍNEA
  doc.setLineWidth(1);
  doc.line(40, 110, 550, 110);

  // ============================
  // DATOS DEL PRODUCTO
  // ============================
  doc.setFontSize(14);
  doc.setFont("Helvetica", "bold");
  doc.text("KARDEX DE PRODUCTO", 40, 140);

  doc.setFontSize(11);
  doc.setFont("Helvetica", "normal");
  doc.text(`Producto: ${product.name}`, 40, 160);
  doc.text(`SKU: ${product.sku}`, 40, 175);
  doc.text(`Categoría: ${product.category || "-"}`, 40, 190);

  // ============================
  // TABLA DEL KARDEX
  // ============================
  const rows = movements.map(m => [
    new Date(m.date).toLocaleDateString(),
    m.type,
    m.type === "entrada" ? m.quantity : "",
    m.type === "salida" ? m.quantity : "",
    m.running_balance,
    m.cost_unit?.toFixed(2),
    m.total?.toFixed(2),
    m.from_branch || "-",
    m.to_branch || "-",
    m.lot || "-",
    m.expires_at || "-"
  ]);

  autoTable(doc, {
    startY: 220,
    head: [[
      "Fecha",
      "Tipo",
      "Entrada",
      "Salida",
      "Saldo",
      "Costo U.",
      "Total",
      "Origen",
      "Destino",
      "Lote",
      "Vence"
    ]],
    body: rows,
    styles: {
      fontSize: 8,
    },
    headStyles: {
      fillColor: [15, 76, 129],
      textColor: "#FFF",
      fontSize: 9,
    },
  });

  // ============================
  // PIE DE PÁGINA
  // ============================
  const finalY = doc.lastAutoTable.finalY || 780;

  doc.setFont("Helvetica", "italic");
  doc.setFontSize(9);
  doc.text(
    "Documento generado por el sistema ERP AgroCentro Nica",
    40,
    finalY + 30
  );

  // DESCARGA
  doc.save(`kardex_${product.sku}.pdf`);
}
