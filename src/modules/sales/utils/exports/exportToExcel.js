import { formatDate } from "../formatters";
import { getClientName, getBranchName, getProductNames } from "../salePresenters";

export const exportSalesToExcel = async ({ sales, totals, filters, branches }) => {
  if (sales.length === 0) {
    alert("No hay ventas para exportar");
    return;
  }

  const XLSX = await import("xlsx");

  const branchName = filters.selectedBranch 
    ? branches.find(b => b.id === filters.selectedBranch)?.name 
    : null;
    
  const summaryData = [
    ["REPORTE DE VENTAS"],
    [filters.dateStart && filters.dateEnd 
      ? `Periodo: ${formatDate(filters.dateStart)} - ${formatDate(filters.dateEnd)}` 
      : "Todas las ventas"],
    [branchName ? `Sucursal: ${branchName}` : "Todas las sucursales"],
    [`Generado: ${new Date().toLocaleDateString("es-NI")}`],
    [],
    ["RESUMEN"],
    ["Total Ventas", totals.totalRevenue],
    ["Ganancia Bruta", totals.totalMargin],
    ["Costo Total", totals.totalCost],
    ["Productos Vendidos", totals.totalItems],
    [],
    ["DETALLE DE VENTAS"],
    ["Fecha", "Factura", "Cliente", "Productos", "Sucursal", "Total", "Margen"],
  ];

  const salesData = sales.map((sale) => [
    formatDate(sale.fecha),
    sale.factura || "-",
    getClientName(sale),
    getProductNames(sale, 5),
    getBranchName(sale, branches),
    sale.total || 0,
    sale.margen || 0,
  ]);

  const allData = [...summaryData, ...salesData];
  const ws = XLSX.utils.aoa_to_sheet(allData);
  ws["!cols"] = [
    { wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Ventas");

  const fileName = filters.dateStart && filters.dateEnd 
    ? `ventas_${filters.dateStart}_${filters.dateEnd}.xlsx`
    : `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
};