import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Generates Kardex PDF for one product
 * @param {Object} org - Organization info (name, ruc, address, phone, logo_url)
 * @param {Object} product - Product info (name, sku, category, unit_weight)
 * @param {Array} movements - Inventory movements list
 */
export async function generateKardexPdf(org, product, movements) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 790;

  // ===============================
  // HEADER ORGANIZATION
  // ===============================
  page.drawText(org.name || "Nombre de empresa", { x: 40, y, size: 18, font: bold });
  y -= 22;

  if (org.ruc) {
    page.drawText(`RUC: ${org.ruc}`, { x: 40, y, size: 10, font });
    y -= 14;
  }
  if (org.address) {
    page.drawText(`Dirección: ${org.address}`, { x: 40, y, size: 10, font });
    y -= 14;
  }
  if (org.phone) {
    page.drawText(`Teléfono: ${org.phone}`, { x: 40, y, size: 10, font });
    y -= 14;
  }

  y -= 20;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });
  y -= 30;

  // ===============================
  // PRODUCT INFO
  // ===============================
  page.drawText(`KARDEX DEL PRODUCTO`, { x: 40, y, size: 14, font: bold });
  y -= 20;

  page.drawText(`Producto: ${product.name}`, { x: 40, y, size: 11, font });
  y -= 14;

  if (product.sku) {
    page.drawText(`SKU: ${product.sku}`, { x: 40, y, size: 11, font });
    y -= 14;
  }

  if (product.category) {
    page.drawText(`Categoría: ${product.category}`, { x: 40, y, size: 11, font });
    y -= 14;
  }

  y -= 10;
  page.drawLine({
    start: { x: 40, y },
    end: { x: 550, y },
    thickness: 1,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= 25;

  // ===============================
  // TABLE HEADER
  // ===============================
  const columns = [
    "Fecha", "Tipo", "Cant.", "Costo", "Total", "Sucursal", "Referencia",
  ];

  let xPositions = [40, 110, 160, 210, 260, 340, 430];

  columns.forEach((col, i) => {
    page.drawText(col, {
      x: xPositions[i],
      y,
      size: 9,
      font: bold,
    });
  });

  y -= 12;

  page.drawLine({
    start: { x: 40, y },
    end: { x: 550, y },
    thickness: 0.5,
  });
  y -= 10;

  // ===============================
  // MOVEMENTS LOOP
  // ===============================
  movements.forEach((m) => {
    if (y < 80) {
      // add new page
      y = 780;
      const newPage = pdf.addPage([595, 842]);
      page = newPage;
    }

    const date = new Date(m.created_at).toLocaleString("es-NI");

    page.drawText(date, { x: xPositions[0], y, size: 8, font });
    page.drawText(m.movement_type, { x: xPositions[1], y, size: 8, font });
    page.drawText(String(m.quantity), { x: xPositions[2], y, size: 8, font });
    page.drawText(`C$${Number(m.cost_unit).toFixed(2)}`, { x: xPositions[3], y, size: 8, font });
    page.drawText(`C$${Number(m.total).toFixed(2)}`, { x: xPositions[4], y, size: 8, font });

    page.drawText(m.branch_name || "-", { x: xPositions[5], y, size: 8, font });
    page.drawText(m.reference || "-", { x: xPositions[6], y, size: 8, font });

    y -= 14;
  });

  // ===============================
  // FOOTER
  // ===============================
  y -= 30;
  page.drawLine({
    start: { x: 200, y },
    end: { x: 400, y },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  y -= 12;
  page.drawText("Firma del encargado", {
    x: 240,
    y,
    size: 10,
    font,
  });

  return await pdf.save();
}
