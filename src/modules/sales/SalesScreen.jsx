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

  const filteredSales = useMemo(() => {
    if (!search) return sales;
    const term = search.toLowerCase();
    return sales.filter((s) => {
      const clientName = getClientName(s.clients).toLowerCase();
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

  // ANULAR VENTA - Restaura inventario
  async function handleCancelSale(saleId) {
    const reason = prompt("Motivo de anulación (opcional):");
    if (reason === null) return; // Usuario canceló el prompt

    if (!confirm("¿Estás seguro de ANULAR esta venta?\n\nEl inventario será restaurado automáticamente.")) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId, action: "cancel" }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert("Venta anulada exitosamente. El inventario ha sido restaurado.");
        loadSales();
        setSelectedSale(null);
      } else {
        alert("Error: " + (data.error || "No se pudo anular la venta"));
      }
    } catch (err) {
      alert("Error al anular venta: " + err.message);
    }
  }

  // ELIMINAR PERMANENTEMENTE (solo admins)
  async function handleDeleteSale(saleId) {
    if (!confirm("¿ELIMINAR PERMANENTEMENTE esta venta?\n\nEsta acción NO restaura el inventario y NO se puede deshacer.\n\nSolo usar si la venta fue creada por error.")) return;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId, action: "delete" }),
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
      getClientName(sale.clients),
      (sale.sales_items || []).length,
      formatCurrency(sale.subtotal),
      formatCurrency(sale.descuento),
      formatCurrency(sale.total),
      sale.status === "cancelled" ? "ANULADA" : formatCurrency(sale.margen),
    ]);

    doc.autoTable({
      startY: 58,
      head: [["Fecha", "Factura", "Cliente", "Items", "Subtotal", "Descuento", "Total", "Margen"]],
      body: tableData,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [51, 65, 85], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
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
      ["Fecha", "Factura", "Cliente", "Items", "Subtotal", "Descuento", "Total", "Margen", "Estado"],
    ];

    const salesData = filteredSales.map((sale) => [
      formatDate(sale.fecha),
      sale.factura || "-",
      getClientName(sale.clients),
      (sale.sales_items || []).length,
      sale.subtotal || 0,
      sale.descuento || 0,
      sale.total || 0,
      sale.margen || 0,
      sale.status === "cancelled" ? "ANULADA" : "Activa",
    ]);

    const allData = [...summaryData, ...salesData];
    const ws = XLSX.utils.aoa_to_sheet(allData);
    ws["!cols"] = [{ wch: 12 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    const fileName = dateStart && dateEnd 
      ? `ventas_${dateStart}_${dateEnd}.xlsx`
      : `ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const exportToCSV = () => {
    if (filteredSales.length === 0) {
      alert("No hay ventas para exportar");
      return;
    }

    let csvContent = "Fecha,Factura,Cliente,Items,Subtotal,Descuento,Total,Margen,Estado\n";
    
    filteredSales.forEach((sale) => {
      const row = [
        formatDate(sale.fecha),
        sale.factura || "-",
        `"${getClientName(sale.clients)}"`,
        (sale.sales_items || []).length,
        sale.subtotal || 0,
        sale.descuento || 0,
        sale.total || 0,
        sale.margen || 0,
        sale.status === "cancelled" ? "ANULADA" : "Activa",
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
          <button onClick={exportToCSV} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg">CSV</button>
          <button onClick={exportToExcel} className="px-3 py-2 text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg">Excel</button>
          <button onClick={exportToPDF} className="px-3 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg">PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Total Ventas</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(totals.totalRevenue)}</p>
          <p className="text-xs text-slate-400">{filteredSales.filter(s => s.status !== "cancelled").length} activas</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <p className="text-xs text-emerald-600">Ganancia Bruta</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(totals.totalMargin)}</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-xs text-red-600">Costo Total</p>
          <p className="text-xl font-bold text-red-700">{formatCurrency(totals.totalCost)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-xs text-blue-600">Productos Vendidos</p>
          <p className="text-xl font-bold text-blue-700">{totals.totalItems}</p>
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
                <th className="text-right p-3 font-medium text-slate-600">Total</th>
                <th className="text-center p-3 font-medium text-slate-600">Estado</th>
                <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length === 0 ? (
                <tr><td colSpan="7" className="text-center p-8 text-slate-400">No hay ventas</td></tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr 
                    key={sale.id} 
                    className={`border-b hover:bg-slate-50 cursor-pointer ${sale.status === "cancelled" ? "bg-red-50 opacity-60" : ""}`}
                    onClick={() => setSelectedSale(sale)}
                  >
                    <td className="p-3">{formatDate(sale.fecha)}</td>
                    <td className="p-3 font-mono text-xs">{sale.factura || "-"}</td>
                    <td className="p-3">{getClientName(sale.clients)}</td>
                    <td className="p-3 text-slate-500">{(sale.sales_items || []).length} items</td>
                    <td className="p-3 text-right font-medium">{formatCurrency(sale.total)}</td>
                    <td className="p-3 text-center">
                      {sale.status === "cancelled" ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">ANULADA</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Activa</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedSale(sale); }} className="text-blue-600 hover:underline text-xs">Ver</button>
                      {sale.status !== "cancelled" && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCancelSale(sale.id); }} 
                          className="ml-2 text-red-600 hover:underline text-xs"
                        >
                          Anular
                        </button>
                      )}
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

      {/* Modal de detalle */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg">Detalle de Venta</h2>
                <p className="text-xs text-slate-500">Factura: {selectedSale.factura || selectedSale.id}</p>
                {selectedSale.status === "cancelled" && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded mt-1 inline-block">VENTA ANULADA</span>
                )}
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
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSale.sales_items || []).map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{item.products?.name || "Producto"}</td>
                        <td className="p-2 text-right">{item.quantity}</td>
                        <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="p-2 text-right">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-medium">
                    <tr className="border-t">
                      <td colSpan="3" className="p-2 text-right font-bold">Total:</td>
                      <td className="p-2 text-right font-bold">{formatCurrency(selectedSale.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {selectedSale.status !== "cancelled" && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button 
                    onClick={() => handleCancelSale(selectedSale.id)} 
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700"
                  >
                    Anular Venta (Restaurar Inventario)
                  </button>
                  <button 
                    onClick={() => handleDeleteSale(selectedSale.id)} 
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Eliminar Permanente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}