import { formatDate } from "../formatters";
import { getClientName, getBranchName, getProductNames } from "../salePresenters";

export const exportSalesToCsv = ({ sales, branches }) => {
  if (sales.length === 0) {
    alert("No hay ventas para exportar");
    return;
  }

  let csvContent = "Fecha,Factura,Cliente,Productos,Sucursal,Total,Margen\n";
  
  sales.forEach((sale) => {
    const row = [
      formatDate(sale.fecha),
      sale.factura || "-",
      `"${getClientName(sale)}"`,
      `"${getProductNames(sale, 5)}"`,
      `"${getBranchName(sale, branches)}"`,
      sale.total || 0,
      sale.margen || 0,
    ];
    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const fileName = `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
  link.download = fileName;
  link.click();
};
