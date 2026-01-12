"use client";

import React, { useMemo, useState, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

function computeDaysToExpire(expiresAt) {
  if (!expiresAt) return null;
  const today = new Date();
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const exp = new Date(expiresAt + "T00:00:00");
  return Math.ceil((exp - base) / (1000 * 60 * 60 * 24));
}

const currencyFormatter = (params) => {
  if (params.value == null) return "-";
  return `C$ ${params.value.toLocaleString("es-NI")}`;
};

const ActionsRenderer = (props) => {
  const { data, onEdit, onDelete, onEntry, onExit, onTransfer, onKardex } = props;
  
  const handleKardex = () => {
    let pid = data.product_id ?? data.id;
    pid = String(pid);
    const cleanUUID = pid.split("-").slice(0, 5).join("-");
    onKardex({ ...data, productId: cleanUUID });
  };

  return (
    <div className="flex gap-1 items-center h-full">
      <button onClick={handleKardex} className="px-1.5 py-0.5 text-[9px] bg-purple-600 text-white rounded hover:bg-purple-700" title="Ver historial">
        Hist
      </button>
      <button onClick={() => onEntry(data)} className="px-1.5 py-0.5 text-[9px] bg-emerald-600 text-white rounded hover:bg-emerald-700" title="Entrada">
        +Ent
      </button>
      <button onClick={() => onExit(data)} className="px-1.5 py-0.5 text-[9px] bg-orange-600 text-white rounded hover:bg-orange-700" title="Salida">
        -Sal
      </button>
      <button onClick={() => onTransfer(data)} className="px-1.5 py-0.5 text-[9px] bg-blue-600 text-white rounded hover:bg-blue-700" title="Traslado">
        Tras
      </button>
      <button onClick={() => onEdit(data)} className="px-1.5 py-0.5 text-[9px] bg-slate-800 text-white rounded hover:bg-slate-700" title="Editar">
        Edit
      </button>
      <button onClick={() => onDelete(data)} className="px-1.5 py-0.5 text-[9px] bg-red-600 text-white rounded hover:bg-red-700" title="Eliminar">
        Del
      </button>
    </div>
  );
};

export default function InventoryGrid({
  products,
  stats,
  onEdit,
  onDelete,
  onEntry,
  onExit,
  onTransfer,
  onKardex,
  orgSlug,
}) {
  const safeProducts = Array.isArray(products) ? products : [];
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const getStock = (p) => p.stock ?? p.quantity ?? 0;
  const getUnitWeight = (p) => p.unitWeight ?? p.unidad_medida ?? p.unit_medida ?? 0;

  const rowData = useMemo(() => {
    return safeProducts.map((p) => {
      const stock = getStock(p);
      const weight = getUnitWeight(p);
      const pricePerLb = p.price && weight ? p.price / weight : null;
      const costTotal = stock * (p.cost ?? 0);
      const daysToExpire = computeDaysToExpire(p.expiresAt);

      return {
        ...p,
        stock,
        weight,
        pricePerLb,
        costTotal,
        daysToExpire,
      };
    });
  }, [safeProducts]);

  const columnDefs = useMemo(() => [
    { 
      field: "name", 
      headerName: "Producto", 
      filter: "agTextColumnFilter",
      minWidth: 140,
      flex: 1,
    },
    { 
      field: "sku", 
      headerName: "Código", 
      filter: "agTextColumnFilter",
      width: 100,
      valueGetter: (params) => params.data.sku ?? params.data.id?.slice(0, 8),
    },
    { 
      field: "category", 
      headerName: "Categoría", 
      filter: "agTextColumnFilter",
      width: 100,
    },
    { 
      field: "branch", 
      headerName: "Bodega", 
      filter: "agTextColumnFilter",
      width: 100,
      valueGetter: (params) => params.data.branch ?? params.data.branch_name,
    },
    { 
      field: "stock", 
      headerName: "Cant", 
      filter: "agNumberColumnFilter",
      width: 70,
      type: "numericColumn",
      cellStyle: (params) => {
        if (params.value <= 0) return { color: "red", fontWeight: "bold" };
        if (params.value < 10) return { color: "orange" };
        return null;
      },
    },
    { 
      field: "weight", 
      headerName: "Peso", 
      filter: "agNumberColumnFilter",
      width: 60,
      type: "numericColumn",
    },
    { 
      field: "cost", 
      headerName: "Costo", 
      filter: "agNumberColumnFilter",
      width: 90,
      type: "numericColumn",
      valueFormatter: currencyFormatter,
    },
    { 
      field: "costTotal", 
      headerName: "Costo Tot", 
      filter: "agNumberColumnFilter",
      width: 100,
      type: "numericColumn",
      valueFormatter: currencyFormatter,
      cellStyle: { fontWeight: "bold" },
    },
    { 
      field: "price", 
      headerName: "Precio", 
      filter: "agNumberColumnFilter",
      width: 90,
      type: "numericColumn",
      valueFormatter: currencyFormatter,
    },
    { 
      field: "pricePerLb", 
      headerName: "$/lb", 
      filter: "agNumberColumnFilter",
      width: 80,
      type: "numericColumn",
      valueFormatter: (params) => params.value ? `C$ ${params.value.toFixed(2)}` : "-",
    },
    { 
      field: "daysToExpire", 
      headerName: "Días Venc", 
      filter: "agNumberColumnFilter",
      width: 85,
      type: "numericColumn",
      cellStyle: (params) => {
        if (params.value == null) return null;
        if (params.value <= 0) return { backgroundColor: "#fee2e2", color: "#dc2626" };
        if (params.value <= 30) return { backgroundColor: "#fef3c7", color: "#d97706" };
        return null;
      },
    },
    { 
      field: "expiresAt", 
      headerName: "Vence", 
      filter: "agDateColumnFilter",
      width: 95,
    },
    {
      headerName: "Acciones",
      width: 220,
      cellRenderer: ActionsRenderer,
      cellRendererParams: {
        onEdit,
        onDelete: setDeleteConfirm,
        onEntry,
        onExit,
        onTransfer,
        onKardex,
      },
      sortable: false,
      filter: false,
    },
  ], [onEdit, onEntry, onExit, onTransfer, onKardex]);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    resizable: true,
    filter: true,
  }), []);

  const {
    totalProducts = safeProducts.length,
    totalUnits = safeProducts.reduce((sum, p) => sum + getStock(p), 0),
    inventoryValue = safeProducts.reduce((sum, p) => sum + getStock(p) * (p.cost ?? 0), 0),
    potentialRevenue = safeProducts.reduce((sum, p) => sum + getStock(p) * (p.price ?? 0), 0),
  } = stats || {};

  const confirmDelete = async () => {
    if (deleteConfirm && onDelete) {
      await onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-800">Confirmar eliminación</h3>
            <p className="text-slate-600 my-4">
              ¿Eliminar <strong>{deleteConfirm.name}</strong>? Esta acción es permanente.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-slate-200 rounded">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Productos</p>
          <p className="text-lg font-semibold">{totalProducts}</p>
        </div>
        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Unidades</p>
          <p className="text-lg font-semibold">{totalUnits.toLocaleString("es-NI")}</p>
        </div>
        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Valor inventario</p>
          <p className="text-lg font-semibold text-emerald-700">C$ {inventoryValue.toLocaleString("es-NI")}</p>
        </div>
        <div className="bg-slate-50 border rounded-lg px-3 py-2">
          <p className="text-slate-500">Potencial de venta</p>
          <p className="text-lg font-semibold text-indigo-700">C$ {potentialRevenue.toLocaleString("es-NI")}</p>
        </div>
      </div>

      {/* AG GRID TABLE */}
      <div className="ag-theme-alpine w-full" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={100}
          paginationPageSizeSelector={[25, 50, 100, 200]}
          animateRows={true}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          enableCellTextSelection={true}
          rowHeight={36}
        />
      </div>
    </div>
  );
}
