"use client";

import React, { useEffect, useState, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
    // First check if there's a client_name directly on the sale
    if (sale?.client_name) return sale.client_name;
    // Then check if there's a linked client
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
      ? "¿Estás seguro de ANULAR esta venta? El inventario será restaurado."
      : "¿Estás seguro de ELIMINAR esta venta permanentemente? Esta acción no se puede deshacer y NO restaurará el inventario.";
    
    if (!confirm(message)) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId, restoreInventory }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Operación exitosa");
        loadSales();
        setSelectedSale(null);
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "No se pudo completar la operación"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  const exportToPDF = () => {
    if (filteredSales.length === 0) {
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

  const exportToExcel = () => {
    if (filteredSales.length === 0) {
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

  const printInvoice = (sale) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(18);
    doc.text("FACTURA", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`No. ${sale.factura || sale.id}`, pageWidth / 2, 28, { align: "center" });

    // Sale info
    doc.setFontSize(10);
    doc.text(`Fecha: ${formatDate(sale.fecha)}`, 14, 45);
    doc.text(`Cliente: ${getClientName(sale)}`, 14, 52);
    if (sale.clients?.phone) doc.text(`Tel: ${sale.clients.phone}`, 14, 59);

    // Items table
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

    // Totals
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, pageWidth - 14, finalY, { align: "right" });
    if (Number(sale.descuento) > 0) {
      doc.text(`Descuento: -${formatCurrency(sale.descuento)}`, pageWidth - 14, finalY + 6, { align: "right" });
    }
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(`TOTAL: ${formatCurrency(sale.total)}`, pageWidth - 14, finalY + 14, { align: "right" });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");
    doc.text("Gracias por su compra", pageWidth / 2, finalY + 30, { align: "center" });

    // Open print dialog
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
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Ventas</h1>
          <p className="text-sm text-slate-500">Historial de ventas del POS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportToCSV} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            CSV
          </button>
          <button onClick={exportToExcel} className="px-3 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Excel
          </button>
          <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Total Ventas</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.totalRevenue)}</p>
          <p className="text-xs text-slate-400">{filteredSales.length} transacciones</p>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-600">Buscar</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cliente, factura, ID..." className="w-full p-2 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Desde</label>
            <input type="date" value={dateStart} onChange={(e) => { setPage(0); setDateStart(e.target.value); }} className="w-full p-2 text-sm border rounded-lg" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Hasta</label>
            <input type="date" value={dateEnd} onChange={(e) => { setPage(0); setDateEnd(e.target.value); }} className="w-full p-2 text-sm border rounded-lg" />
          </div>
        </div>
      </div>

      {loading && <p className="text-center text-slate-500">Cargando ventas...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">Fecha</th>
                <th className="text-left p-3 font-medium text-slate-600">Factura</th>
                <th className="text-left p-3 font-medium text-slate-600">Cliente</th>
                <th className="text-left p-3 font-medium text-slate-600">Productos</th>
                <th className="text-right p-3 font-medium text-slate-600">Subtotal</th>
                <th className="text-right p-3 font-medium text-slate-600">Descuento</th>
                <th className="text-right p-3 font-medium text-slate-600">Total</th>
                <th className="text-right p-3 font-medium text-slate-600">Margen</th>
                <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr><td colSpan="9" className="text-center p-8 text-slate-400">No hay ventas</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedSale(sale)}>
                    <td className="p-3">{formatDate(sale.fecha)}</td>
                    <td className="p-3 font-mono text-xs">{sale.factura || "-"}</td>
                    <td className="p-3">{getClientName(sale)}</td>
                    <td className="p-3 text-slate-500">{(sale.sales_items || []).length} items</td>
                    <td className="p-3 text-right">{formatCurrency(sale.subtotal)}</td>
                    <td className="p-3 text-right text-orange-600">{formatCurrency(sale.descuento)}</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(sale.total)}</td>
                    <td className="p-3 text-right text-emerald-600">{formatCurrency(sale.margen)}</td>
                    <td className="p-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }} className="text-blue-600 hover:underline text-xs">Ver</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center p-3 border-t bg-slate-50">
            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Anterior</button>
            <span className="text-sm text-slate-500">Página {page + 1}</span>
            <button onClick={() => setPage(page + 1)} disabled={filteredSales.length < limit} className="px-3 py-1 text-sm border rounded disabled:opacity-50">Siguiente</button>
          </div>
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
                  <p className="font-medium">{getClientName(selectedSale)}</p>
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
                <button onClick={() => printInvoice(selectedSale)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  Imprimir Factura
                </button>
                <button onClick={() => handleCancelSale(selectedSale.id, true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                  Anular Venta (Restaurar Inventario)
                </button>
                <button onClick={() => handleCancelSale(selectedSale.id, false)} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
                  Eliminar Permanente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
