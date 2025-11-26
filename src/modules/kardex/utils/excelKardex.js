import * as XLSX from "xlsx";

export function exportKardexExcel({ org, product, movements }) {
  if (!movements || movements.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // ===============================================
  // Construir filas del Excel
  // ===============================================

  const rows = movements.map((m) => ({
    Fecha: new Date(m.date).toLocaleString(),
    Tipo: m.type,
    Entrada: m.type === "entrada" ? m.quantity : "",
    Salida: m.type === "salida" ? m.quantity : "",
    Saldo: m.running_balance,
    "Costo Unitario": Number(m.cost_unit).toFixed(2),
    Total: Number(m.total).toFixed(2),
    Origen: m.from_branch || "-",
    Destino: m.to_branch || "-",
    Lote: m.lot || "-",
    "Fecha Venc.": m.expires_at || "-"
  }));

  // Crear hoja
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Ajustar tamaño de columnas automáticamente
  const colWidths = rows.reduce((acc, row) => {
    Object.keys(row).forEach((key, idx) => {
      const cellLength = String(row[key]).length + 5;
      acc[idx] = Math.max(acc[idx] || 10, cellLength);
    });
    return acc;
  }, []);

  worksheet["!cols"] = colWidths.map((w) => ({ wch: w }));

  // Crear libro
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "KARDEX");

  // Nombre archivo
  const filename = `Kardex_${product?.sku || "producto"}.xlsx`;

  // Descargar
  XLSX.writeFile(workbook, filename);
}
