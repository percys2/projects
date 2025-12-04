// ====================================
//  exportKardexExcel.js (COMPLETO)
//  Kardex ERP – Export Excel CORRECTO
// ====================================

import * as XLSX from "xlsx";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function exportKardexExcel({
  org,
  product,
  branch,
  movements,
  dateStart,
  dateEnd,
}) {
  if (!movements || movements.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // ==============================================
  // MAPEO CORRECTO DE CAMPOS (TU ESTRUCTURA REAL)
  // ==============================================
  const rows = movements.map((m) => ({
    Fecha: format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: es }),

    Movimiento: String(m.movement_type || m.type || "N/A").toUpperCase(),

    Cantidad: Number(m.qty || 0),

    "Costo Unitario": Number(m.cost_unit || 0),

    "Costo Total": Number(m.total_cost || 0),

    "Sucursal Origen": m.from_branch || "-",

    "Sucursal Destino": m.to_branch || "-",

    Referencia: m.reference || "-",

    Usuario: m.user?.full_name || m.user?.email || "-",
  }));

  // ==============================================
  // CREAR HOJA
  // ==============================================
  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Auto tamaño de columnas
  const colWidths = Object.keys(rows[0]).map((key) => ({
    wch: Math.max(key.length + 5, 15),
  }));

  worksheet["!cols"] = colWidths;

  // ==============================================
  // CREAR LIBRO
  // ==============================================
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Kardex");

  // ==============================================
  // NOMBRE ARCHIVO
  // ==============================================
  const fileName =
    `Kardex_${product?.name || "Todos"}_${Date.now()}.xlsx`;

  XLSX.writeFile(workbook, fileName);
}
