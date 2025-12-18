"use client";

import React, { useEffect, useState, useMemo } from "react";
// PERFORMANCE FIX: Removed static imports of heavy libraries (jsPDF, xlsx)
// They are now dynamically imported only when needed

export default function SalesScreen({ orgSlug }) {
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState({ totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [search, setSearch] = useState("");

  const [selectedSale, setSelectedSale] = useState(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  const getClientName = (sale) => {
    if (sale?.client_name) return sale.client_name;
    const client = sale?.clients;
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

  const filteredSales = useMemo(() => {
    if (!search) return sales;
    const term = search.toLowerCase();
    return sales.filter((s) => {
      const clientName = getClientName(s).toLowerCase();
      return clientName.includes(term) ||
        s.factura?.toLowerCase().includes(term) ||
        s.id?.toLowerCase().includes(term);
    });
  }, [sales, search]);

  const formatCurrency = (amount) => `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("es-NI");
  };

  async function handleCancelSale(saleId, restoreInventory = false) {
    const message = restoreInventory 
      ? "Estas seguro de ANULAR esta venta? El inventario sera restaurado."
      : "Estas seguro de ELIMINAR esta venta permanentemente? Esta accion no se puede deshacer y NO restaurara el inventario.";
    
    if (!confirm(message)) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId, restoreInventory }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Operacion exitosa");
        loadSales();
        setSelectedSale(null);
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "No se pudo completar la operacion"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  // PERFORMANCE FIX: Dynamic import of jsPDF only when user clicks export
  const exportToPDF = async () => {
    if (filteredSales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    // Dynamic import - only loads when needed
    const jsPDF = (await import("jspdf")).default;
    await import("jspdf-autotable");

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

    const tableData = filteredSales.map((sale) => [
      formatDate(sale.fecha),
      sale.factura || "-",
      getClientName(sale),
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

  // PERFORMANCE FIX: Dynamic import of xlsx only when user clicks export
  const exportToExcel = async () => {
    if (filteredSales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    // Dynamic import - only loads when needed
    const XLSX = await import("xlsx");

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

    const salesData = filteredSales.map((sale) => [
      formatDate(sale.fecha),
      sale.factura || "-",
      getClientName(sale),
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

  // PERFORMANCE FIX: Dynamic import for print invoice
  const printInvoice = async (sale) => {
    const jsPDF = (await import("jspdf")).default;
    await import("jspdf-autotable");
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("FACTURA", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`No. ${sale.factura || sale.id}`, pageWidth / 2, 28, { align: "center" });

    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDate(sale.fecha)}`, 14, 45);
    doc.text(`Cliente: ${getClientName(sale)}`, 14, 52);
    if (sale.clients?.phone) doc.text(`Tel: ${sale.clients.phone}`, 14, 59);

    const tableData = (sale.sales_items || []).map((item) => [
      item.products?.name || "Producto",
      item.quantity,
      formatCurrency(item.price),
      formatCurrency(item.subtotal),
    ]);

    doc.autoTable({
      startY: 70,
      head: [["Producto", "Cant.", "Precio", "Subtotal"]],
      body: tableData,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 25, halign: "center" },
        2: { cellWidth: 35, halign: "right" },
        3: { cellWidth: 35, halign: "right" },
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, pageWidth - 14, finalY, { align: "right" });
    if (Number(sale.descuento) > 0) {
      doc.text(`Descuento: -${formatCurrency(sale.descuento)}`, pageWidth - 14, finalY + 6, { align: "right" });
    }
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`TOTAL: ${formatCurrency(sale.total)}`, pageWidth - 14, finalY + 14, { align: "right" });

    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("Gracias por su compra", pageWidth / 2, finalY + 30, { align: "center" });

    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  };

  const exportToCSV = () => {
    if (filteredSales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    let csvContent = "Fecha,Factura,Cliente,Items,Subtotal,Descuento,Total,Margen\n";
    
    filteredSales.forEach((sale) => {
      const row = [
        formatDate(sale.fecha),
        sale.factura || "-",
        `"${getClientName(sale)}"`,
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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Ventas</h1>
          <p className="text-xs sm:text-sm text-slate-500">Historial de ventas del POS</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportToCSV} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            CSV
          </button>
          <button onClick={exportToExcel} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button onClick={exportToPDF} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-slate-500">Total Ventas</p>
          <p className="text-base sm:text-xl font-bold text-slate-800">{formatCurrency(totals.totalRevenue)}</p>
          <p className="text-[10px] sm:text-xs text-slate-400">{filteredSales.length} transacciones</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-emerald-600">Ganancia Bruta</p>
          <p className="text-base sm:text-xl font-bold text-emerald-700">{formatCurrency(totals.totalMargin)}</p>
          <p className="text-[10px] sm:text-xs text-emerald-500">{totals.totalRevenue > 0 ? ((totals.totalMargin / totals.totalRevenue) * 100).toFixed(1) : 0}% margen</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-red-600">Costo Total</p>
          <p className="text-base sm:text-xl font-bold text-red-700">{formatCurrency(totals.totalCost)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-blue-600">Productos Vendidos</p>
          <p className="text-base sm:text-xl font-bold text-blue-700">{totals.totalItems}</p>
          <p className="text-[10px] sm:text-xs text-blue-400">unidades</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Buscar</label>
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Cliente, factura, ID..." 
              className="w-full p-2 text-sm border rounded-lg min-h-[44px]" 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Fecha inicio</label>
            <input 
              type="date" 
              value={dateStart} 
              onChange={(e) => setDateStart(e.target.value)} 
              className="w-full p-2 text-sm border rounded-lg min-h-[44px]" 
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Fecha fin</label>
            <input 
              type="date" 
              value={dateEnd} 
              onChange={(e) => setDateEnd(e.target.value)} 
              className="w-full p-2 text-sm border rounded-lg min-h-[44px]" 
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => { setDateStart(""); setDateEnd(""); setSearch(""); }} 
              className="w-full px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg min-h-[44px]"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Sales List - Mobile Cards */}
      <div className="lg:hidden space-y-2">
        {loading ? (
          <p className="text-center py-8 text-slate-500">Cargando ventas...</p>
        ) : error ? (
          <p className="text-center py-8 text-red-500">Error: {error}</p>
        ) : filteredSales.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No hay ventas</p>
        ) : (
          filteredSales.map((sale) => (
            <div 
              key={sale.id} 
              className="bg-white border rounded-lg p-3 shadow-sm"
              onClick={() => setSelectedSale(selectedSale?.id === sale.id ? null : sale)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{sale.factura || sale.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500 truncate">{getClientName(sale)}</p>
                  <p className="text-xs text-slate-400">{formatDate(sale.fecha)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-emerald-600">{formatCurrency(sale.total)}</p>
                  <p className="text-[10px] text-slate-400">{(sale.sales_items || []).length} items</p>
                </div>
              </div>
              
              {selectedSale?.id === sale.id && (
                <div className="mt-3 pt-3 border-t space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>Subtotal: <strong>{formatCurrency(sale.subtotal)}</strong></div>
                    <div>Descuento: <strong>{formatCurrency(sale.descuento)}</strong></div>
                    <div>Margen: <strong>{formatCurrency(sale.margen)}</strong></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); printInvoice(sale); }}
                      className="flex-1 px-2 py-2 text-xs bg-blue-600 text-white rounded"
                    >
                      Imprimir
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCancelSale(sale.id, true); }}
                      className="flex-1 px-2 py-2 text-xs bg-orange-600 text-white rounded"
                    >
                      Anular
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCancelSale(sale.id, false); }}
                      className="flex-1 px-2 py-2 text-xs bg-red-600 text-white rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Sales Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Factura</th>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-right">Descuento</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3 text-right">Margen</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Cargando ventas...</td></tr>
              ) : error ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-red-500">Error: {error}</td></tr>
              ) : filteredSales.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No hay ventas</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-3">{formatDate(sale.fecha)}</td>
                    <td className="px-4 py-3 font-medium">{sale.factura || "-"}</td>
                    <td className="px-4 py-3">{getClientName(sale)}</td>
                    <td className="px-4 py-3 text-center">{(sale.sales_items || []).length}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(sale.subtotal)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(sale.descuento)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.total)}</td>
                    <td className="px-4 py-3 text-right text-emerald-600">{formatCurrency(sale.margen)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => printInvoice(sale)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Imprimir</button>
                        <button onClick={() => handleCancelSale(sale.id, true)} className="px-2 py-1 text-xs bg-orange-600 text-white rounded">Anular</button>
                        <button onClick={() => handleCancelSale(sale.id, false)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <button 
          onClick={() => setPage(Math.max(0, page - 1))} 
          disabled={page === 0}
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]"
        >
          Anterior
        </button>
        <span className="px-4 py-2 text-sm flex items-center">Pagina {page + 1}</span>
        <button 
          onClick={() => setPage(page + 1)} 
          disabled={filteredSales.length < limit}
          className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}