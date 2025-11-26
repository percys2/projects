import * as XLSX from "xlsx";
import { format } from "date-fns";

export function exportKardexExcel({
  org,
  product,
  branch,
  movements,
  dateStart,
  dateEnd,
}) {
  // -----------------------------------------
  // 1. Convertir datos al formato Excel
  // -----------------------------------------
  const excelData = movements.map((m) => ({
    Fecha: format(new Date(m.created_at), "dd/MM/yyyy HH:mm"),
    Movimiento: m.movement_type.toUpperCase(),
    Cantidad: m.qty,
    "Costo Unitario": m.cost_unit,
    "Costo Total": m.total_cost,
    "Sucursal Origen": m.from_branch || "-",
    "Sucursal Destino": m.to_branch || "-",
    Referencia: m.reference || "-",
    Usuario: m.user?.full_name || m.user?.email || "-",
  }));

  // -----------------------------------------
  // 2. Crear hoja de Excel
  // -----------------------------------------
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Kardex");

  // -----------------------------------------
  // 3. Nombre del archivo
  // -----------------------------------------
  const fileName = `Kardex_${product?.name || "Todos"}_${Date.now()}.xlsx`;

  // -----------------------------------------
  // 4. Exportar
  // -----------------------------------------
  XLSX.writeFile(workbook, fileName);
}
