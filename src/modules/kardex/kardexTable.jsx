"use client";

import React, { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatCurrency } from "../POS/utils/formatCurrency";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function KardexTable({
  data = [],
  page,
  setPage,
  limit,
  product,
  onPrint,
  onExportExcel,
}) {
  const safeData = Array.isArray(data) ? data : [];

  const totals = safeData.reduce(
    (acc, m) => {
      const qty = Number(m.qty || m.quantity || 0);
      const cost = Number(m.cost_unit || m.cost || 0);
      const totalCost = Number(m.total_cost || m.total || qty * cost);
      const type = m.movement_type;

      if (type === "entrada") {
        acc.entradas += qty;
        acc.costoEntradas += totalCost;
      }
      if (type === "salida") {
        acc.salidas += qty;
        acc.costoSalidas += totalCost;
      }

      return acc;
    },
    { entradas: 0, salidas: 0, costoEntradas: 0, costoSalidas: 0 }
  );

  const rowData = useMemo(() => {
    return safeData.map((m) => {
      const qty = Number(m.qty || m.quantity || 0);
      const cost = Number(m.cost_unit || m.cost || 0);
      const total = Number(m.total_cost || m.total || qty * cost);

      return {
        ...m,
        qty,
        cost,
        total,
        formattedDate: m.created_at ? format(new Date(m.created_at), "dd/MM/yyyy HH:mm", { locale: es }) : "-",
      };
    });
  }, [safeData]);

  const columnDefs = useMemo(() => [
    {
      field: "formattedDate",
      headerName: "Fecha",
      filter: "agTextColumnFilter",
      width: 140,
    },
    {
      field: "movement_type",
      headerName: "Movimiento",
      filter: "agTextColumnFilter",
      width: 110,
      cellStyle: (params) => {
        const type = params.value;
        if (type === "entrada") return { color: "#16a34a", fontWeight: "600" };
        if (type === "salida") return { color: "#dc2626", fontWeight: "600" };
        if (type === "transferencia") return { color: "#2563eb", fontWeight: "600" };
        if (type === "venta") return { color: "#ea580c", fontWeight: "600" };
        if (type === "ajuste") return { color: "#374151", fontWeight: "600" };
        return null;
      },
      valueFormatter: (params) => params.value?.toUpperCase() || "-",
    },
    {
      field: "product_name",
      headerName: "Producto",
      filter: "agTextColumnFilter",
      minWidth: 150,
      flex: 1,
    },
    {
      field: "qty",
      headerName: "Cantidad",
      filter: "agNumberColumnFilter",
      width: 90,
      type: "numericColumn",
      cellStyle: { fontWeight: "600" },
    },
    {
      field: "cost",
      headerName: "Costo",
      filter: "agNumberColumnFilter",
      width: 100,
      type: "numericColumn",
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "total",
      headerName: "Total",
      filter: "agNumberColumnFilter",
      width: 110,
      type: "numericColumn",
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: "from_branch_name",
      headerName: "Origen",
      filter: "agTextColumnFilter",
      width: 110,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "to_branch_name",
      headerName: "Destino",
      filter: "agTextColumnFilter",
      width: 110,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "reference",
      headerName: "Referencia",
      filter: "agTextColumnFilter",
      width: 150,
      cellStyle: { color: "#64748b" },
      valueGetter: (params) => params.data.reference || params.data.notes || params.data.description || "-",
    },
    {
      field: "user_full_name",
      headerName: "Usuario",
      filter: "agTextColumnFilter",
      width: 120,
      valueGetter: (params) => params.data.user_full_name || params.data.user_email || "-",
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base font-bold">
          Kardex — {product?.name || "Todos los productos"}
        </h3>

        <div className="flex gap-2">
          <button
            onClick={onPrint}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs hover:bg-slate-800"
          >
            Imprimir
          </button>
          <button
            onClick={onExportExcel}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs hover:bg-green-700"
          >
            Excel
          </button>
        </div>
      </div>

      {/* Totales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-[11px] text-green-700 uppercase">Entradas</p>
          <p className="text-green-900 font-bold">{totals.entradas}</p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[11px] text-red-700 uppercase">Salidas</p>
          <p className="text-red-900 font-bold">{totals.salidas}</p>
        </div>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[11px] text-blue-700 uppercase">Costo Entradas</p>
          <p className="text-blue-900 font-bold">{formatCurrency(totals.costoEntradas)}</p>
        </div>
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-[11px] text-gray-700 uppercase">Balance</p>
          <p className="text-gray-900 font-bold">{totals.entradas - totals.salidas}</p>
        </div>
      </div>

      {/* AG Grid Table */}
      <div className="ag-theme-alpine w-full" style={{ height: "calc(100vh - 350px)", minHeight: 300 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={50}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          animateRows={true}
          enableCellTextSelection={true}
          rowHeight={32}
        />
      </div>
    </div>
  );
}
