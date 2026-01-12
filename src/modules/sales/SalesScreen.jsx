"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function SalesScreen({ orgSlug }) {
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState({ totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [selectedSale, setSelectedSale] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 200;

  const getClientName = (client) => {
    if (!client) return "Cliente general";
    const firstName = client.first_name || "";
    const lastName = client.last_name || "";
    return `${firstName} ${lastName}`.trim() || "Cliente general";
  };

  async function loadSales() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit, offset: page * limit });
      if (dateStart) params.append("startDate", dateStart);
      if (dateEnd) params.append("endDate", dateEnd);

      const res = await fetch(`/api/sales?${params.toString()}`, {
        headers: { "x-org-slug": orgSlug },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error loading sales");

      setSales(json.sales || []);
      setTotals(json.totals || { totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orgSlug) loadSales();
  }, [orgSlug, dateStart, dateEnd, page]);

  const formatCurrency = (amount) => `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-NI");
  };

  const rowData = useMemo(() => {
    return sales.map((sale) => ({
      ...sale,
      clientName: getClientName(sale.clients),
      itemCount: (sale.sales_items || []).length,
      formattedDate: formatDate(sale.fecha),
    }));
  }, [sales]);

  async function handleAnularSale(sale) {
    if (!confirm(`¿Estás seguro de ANULAR la venta ${sale.factura || sale.id}? Esta acción no se puede deshacer.`)) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: sale.id }),
      });
      
      if (res.ok) {
        loadSales();
        alert("Venta anulada correctamente");
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "No se pudo anular"));
      }
    } catch (err) {
      alert("Error al anular venta: " + err.message);
    }
  }

  function handlePrintSale(sale) {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) {
      alert("Por favor permite las ventanas emergentes para imprimir");
      return;
    }

    const items = sale.sales_items || [];
    const clientName = getClientName(sale.clients);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo - ${sale.factura || sale.id}</title>
        <style>
          body { font-family: 'Courier New', monospace; font-size: 12px; padding: 10px; max-width: 300px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin: 0 0 5px 0; font-size: 16px; }
          .info { margin-bottom: 10px; }
          .info p { margin: 2px 0; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { text-align: left; padding: 3px 0; }
          th { border-bottom: 1px solid #000; }
          .right { text-align: right; }
          .total-row { border-top: 1px dashed #000; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; font-size: 10px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>RECIBO DE VENTA</h2>
          <p>Factura: ${sale.factura || "-"}</p>
        </div>
        
        <div class="info">
          <p><strong>Fecha:</strong> ${formatDate(sale.fecha)}</p>
          <p><strong>Cliente:</strong> ${clientName}</p>
          ${sale.clients?.phone ? `<p><strong>Tel:</strong> ${sale.clients.phone}</p>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th class="right">Cant</th>
              <th class="right">Precio</th>
              <th class="right">Subt</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>${item.products?.name || "Producto"}</td>
                <td class="right">${item.quantity}</td>
                <td class="right">${formatCurrency(item.price)}</td>
                <td class="right">${formatCurrency(item.subtotal)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="right">${formatCurrency(sale.subtotal)}</td>
          </tr>
          ${Number(sale.descuento) > 0 ? `
          <tr>
            <td>Descuento:</td>
            <td class="right">-${formatCurrency(sale.descuento)}</td>
          </tr>
          ` : ""}
          ${Number(sale.iva) > 0 ? `
          <tr>
            <td>IVA:</td>
            <td class="right">${formatCurrency(sale.iva)}</td>
          </tr>
          ` : ""}
          <tr class="total-row">
            <td><strong>TOTAL:</strong></td>
            <td class="right"><strong>${formatCurrency(sale.total)}</strong></td>
          </tr>
        </table>

        <div class="footer">
          <p>Gracias por su compra</p>
          <p>${new Date().toLocaleString("es-NI")}</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  }

  const ActionsRenderer = useCallback((props) => {
    return (
      <div className="flex gap-1 items-center h-full">
        <button
          onClick={() => setSelectedSale(props.data)}
          className="px-1.5 py-0.5 text-[9px] bg-blue-600 text-white rounded hover:bg-blue-700"
          title="Ver detalle"
        >
          Ver
        </button>
        <button
          onClick={() => handlePrintSale(props.data)}
          className="px-1.5 py-0.5 text-[9px] bg-slate-700 text-white rounded hover:bg-slate-600"
          title="Imprimir recibo"
        >
          Impr
        </button>
        <button
          onClick={() => handleAnularSale(props.data)}
          className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded hover:bg-red-700"
          title="Anular venta"
        >
          Anular
        </button>
      </div>
    );
  }, [orgSlug]);

  const columnDefs = useMemo(() => [
    {
      field: "formattedDate",
      headerName: "Fecha",
      filter: "agTextColumnFilter",
      width: 100,
    },
    {
      field: "factura",
      headerName: "Factura",
      filter: "agTextColumnFilter",
      width: 120,
      cellStyle: { fontFamily: "monospace", fontSize: "11px" },
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "clientName",
      headerName: "Cliente",
      filter: "agTextColumnFilter",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "itemCount",
      headerName: "Items",
      filter: "agNumberColumnFilter",
      width: 80,
      type: "numericColumn",
      cellStyle: { color: "#64748b" },
      valueFormatter: (params) => `${params.value} items`,
    },
    {
      field: "subtotal",
      headerName: "Subtotal",
      filter: "agNumberColumnFilter",
      width: 110,
      type: "numericColumn",
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "descuento",
      headerName: "Descuento",
      filter: "agNumberColumnFilter",
      width: 100,
      type: "numericColumn",
      cellStyle: { color: "#ea580c" },
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "total",
      headerName: "Total",
      filter: "agNumberColumnFilter",
      width: 110,
      type: "numericColumn",
      cellStyle: { fontWeight: "600" },
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "margen",
      headerName: "Margen",
      filter: "agNumberColumnFilter",
      width: 110,
      type: "numericColumn",
      cellStyle: { color: "#16a34a" },
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      headerName: "Acciones",
      width: 150,
      cellRenderer: ActionsRenderer,
      sortable: false,
      filter: false,
    },
  ], [ActionsRenderer]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  async function handleDeleteSale(saleId) {
    if (!confirm("¿Estás seguro de ELIMINAR esta venta? Esta acción no se puede deshacer.")) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId }),
      });
      
      if (res.ok) {
        loadSales();
        setSelectedSale(null);
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "No se pudo eliminar"));
      }
    } catch (err) {
      alert("Error al eliminar venta: " + err.message);
    }
  }

  const exportToPDF = () => {
    if (sales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("Reporte de Ventas", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    const periodText = dateStart && dateEnd 
      ? `Periodo: ${formatDate(dateStart)} - ${formatDate(dateEnd)}`
      : "Todas las ventas";
    doc.text(periodText, pageWidth / 2, 28, { align: "center" });
    doc.text(`Generado: ${new Date().toLocaleDateString("es-NI")}`, pageWidth / 2, 34, { align: "center" });

    doc.setFontSize(9);
    doc.text(`Total Ventas: ${formatCurrency(totals.totalRevenue)}`, 14, 45);
    doc.text(`Ganancia Bruta: ${formatCurrency(totals.totalMargin)}`, 14, 51);
    doc.text(`Costo Total: ${formatCurrency(totals.totalCost)}`, 100, 45);
    doc.text(`Productos Vendidos: ${totals.totalItems}`, 100, 51);

    const tableData = sales.map((sale) => [
      formatDate(sale.fecha),
      sale.factura || "-",
      getClientName(sale.clients),
      (sale.sales_items || []).length,
      formatCurrency(sale.subtotal),
      formatCurrency(sale.descuento),
      formatCurrency(sale.total),
      formatCurrency(sale.margen),
    ]);

    doc.autoTable({
      startY: 58,
      head: [["Fecha", "Factura", "Cliente", "Items", "Subtotal", "Descuento", "Total", "Margen"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 25, halign: "right" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 25, halign: "right" },
        7: { cellWidth: 25, halign: "right" },
      },
    });

    const fileName = dateStart && dateEnd 
      ? `ventas_${dateStart}_${dateEnd}.pdf`
      : `ventas_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = () => {
    if (sales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    const summaryData = [
      ["REPORTE DE VENTAS"],
      [dateStart && dateEnd ? `Periodo: ${formatDate(dateStart)} - ${formatDate(dateEnd)}` : "Todas las ventas"],
      [`Generado: ${new Date().toLocaleDateString("es-NI")}`],
      [],
      ["RESUMEN"],
      ["Total Ventas", totals.totalRevenue],
      ["Ganancia Bruta", totals.totalMargin],
      ["Costo Total", totals.totalCost],
      ["Productos Vendidos", totals.totalItems],
      [],
      ["DETALLE DE VENTAS"],
      ["Fecha", "Factura", "Cliente", "Items", "Subtotal", "Descuento", "Total", "Margen"],
    ];

    const salesData = sales.map((sale) => [
      formatDate(sale.fecha),
      sale.factura || "-",
      getClientName(sale.clients),
      (sale.sales_items || []).length,
      sale.subtotal || 0,
      sale.descuento || 0,
      sale.total || 0,
      sale.margen || 0,
    ]);

    const allData = [...summaryData, ...salesData];

    const ws = XLSX.utils.aoa_to_sheet(allData);

    ws["!cols"] = [
      { wch: 12 },
      { wch: 15 },
      { wch: 25 },
      { wch: 8 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    const fileName = dateStart && dateEnd 
      ? `ventas_${dateStart}_${dateEnd}.xlsx`
      : `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToCSV = () => {
    if (sales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    let csvContent = "Fecha,Factura,Cliente,Items,Subtotal,Descuento,Total,Margen\n";
    
    sales.forEach((sale) => {
      const row = [
        formatDate(sale.fecha),
        sale.factura || "-",
        `"${getClientName(sale.clients)}"`,
        (sale.sales_items || []).length,
        sale.subtotal || 0,
        sale.descuento || 0,
        sale.total || 0,
        sale.margen || 0,
      ];
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    const fileName = dateStart && dateEnd 
      ? `ventas_${dateStart}_${dateEnd}.csv`
      : `ventas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.download = fileName;
    link.click();
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
          <p className="text-sm text-slate-500">Historial de ventas del POS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1">
            CSV
          </button>
          <button onClick={exportToExcel} className="px-3 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center gap-1">
            Excel
          </button>
          <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-1">
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Total Ventas</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.totalRevenue)}</p>
          <p className="text-xs text-slate-400">{sales.length} transacciones</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <p className="text-xs text-emerald-600">Ganancia Bruta</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totals.totalMargin)}</p>
          <p className="text-xs text-emerald-500">{totals.totalRevenue > 0 ? ((totals.totalMargin / totals.totalRevenue) * 100).toFixed(1) : 0}% margen</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-600">Costo Total</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totals.totalCost)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-600">Productos Vendidos</p>
          <p className="text-xl font-bold text-blue-700">{totals.totalItems}</p>
          <p className="text-xs text-blue-400">unidades</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Desde</label>
            <input type="date" value={dateStart} onChange={(e) => { setPage(0); setDateStart(e.target.value); }} className="w-full p-2 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Hasta</label>
            <input type="date" value={dateEnd} onChange={(e) => { setPage(0); setDateEnd(e.target.value); }} className="w-full p-2 text-sm border rounded-lg" />
          </div>
          <div className="flex items-end">
            <button onClick={loadSales} className="px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700">
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-slate-500">Cargando ventas...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && (
        <div className="ag-theme-alpine w-full" style={{ height: "calc(100vh - 380px)", minHeight: 300 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={50}
            paginationPageSizeSelector={[25, 50, 100, 200]}
            animateRows={true}
            enableCellTextSelection={true}
            rowHeight={36}
            onRowDoubleClicked={(e) => setSelectedSale(e.data)}
          />
        </div>
      )}

      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">Detalle de Venta</h2>
                <p className="text-xs text-slate-500">Factura: {selectedSale.factura || selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Fecha</p>
                  <p className="font-medium">{formatDate(selectedSale.fecha)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cliente</p>
                  <p className="font-medium">{getClientName(selectedSale.clients)}</p>
                  {selectedSale.clients?.phone && <p className="text-xs text-slate-400">{selectedSale.clients.phone}</p>}
                  {selectedSale.clients?.city && <p className="text-xs text-slate-400">{selectedSale.clients.city}</p>}
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500 mb-2">Productos</p>
                <table className="w-full text-sm border rounded">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left p-2">Producto</th>
                      <th className="text-right p-2">Cant.</th>
                      <th className="text-right p-2">Precio</th>
                      <th className="text-right p-2">Subtotal</th>
                      <th className="text-right p-2">Margen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.sales_items || []).map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{item.products?.name || "Producto"}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.subtotal)}</td>
                        <td className="p-2 text-right text-emerald-600">{formatCurrency(item.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-medium">
                    <tr className="border-t">
                      <td colSpan="3" className="p-2 text-right">Subtotal:</td>
                      <td className="p-2 text-right">{formatCurrency(selectedSale.subtotal)}</td>
                      <td></td>
                    </tr>
                    {Number(selectedSale.descuento) > 0 && (
                      <tr>
                        <td colSpan="3" className="p-2 text-right text-orange-600">Descuento:</td>
                        <td className="p-2 text-right text-orange-600">-{formatCurrency(selectedSale.descuento)}</td>
                        <td></td>
                      </tr>
                    )}
                    {Number(selectedSale.iva) > 0 && (
                      <tr>
                        <td colSpan="3" className="p-2 text-right">IVA:</td>
                        <td className="p-2 text-right">{formatCurrency(selectedSale.iva)}</td>
                        <td></td>
                      </tr>
                    )}
                    <tr className="border-t">
                      <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(selectedSale.total)}</td>
                      <td className="p-2 text-right text-emerald-600 font-bold">{formatCurrency(selectedSale.margen)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button onClick={() => handlePrintSale(selectedSale)} className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600">
                  Imprimir
                </button>
                <button onClick={() => { handleAnularSale(selectedSale); setSelectedSale(null); }} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Anular Venta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
