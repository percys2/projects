"use client";

import React from "react";
import { formatCurrency } from "../POS/utils/formatCurrency";

const TIMEZONE = "America/Managua";

const formatKardexDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("es-NI", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatShortDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return d.toLocaleString("es-NI", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export default function KardexTable({
  data = [],
  page,
  setPage,
  limit,
  product,
  branch,
  onPrint,
  onExportExcel,
}) {
  const totals = data.reduce(
    (acc, m) => {
      const rawQty = Number(m.qty || m.quantity || 0);
      const qty = isNaN(rawQty) ? 0 : rawQty;
      const cost = Number(m.cost_unit || m.cost || 0);
      const totalCost = Number(m.total_cost || m.total || Math.abs(qty) * cost);

      const type = (m.movement_type || "").toUpperCase();

      const isEntrada =
        type === "ENTRADA" ||
        type === "ENTRY" ||
        type === "SALE_CANCEL" ||
        type === "PURCHASE" ||
        type === "ADJUSTMENT_IN";

      const isSalida =
        type === "SALIDA" ||
        type === "EXIT" ||
        type === "SALE" ||
        type === "VENTA" ||
        type === "ADJUSTMENT_OUT";

      if (isEntrada) {
        acc.entradas += Math.abs(qty);
        acc.costoEntradas += Math.abs(totalCost);
      } else if (isSalida) {
        acc.salidas += Math.abs(qty);
        acc.costoSalidas += Math.abs(totalCost);
      }

      return acc;
    },
    { entradas: 0, salidas: 0, costoEntradas: 0, costoSalidas: 0 }
  );

  const getTypeColor = (type) => {
    const t = (type || "").toUpperCase();
    if (t === "ENTRADA" || t === "ENTRY" || t === "SALE_CANCEL" || t === "PURCHASE") {
      return "bg-green-100 text-green-700";
    }
    if (t === "SALIDA" || t === "EXIT" || t === "SALE" || t === "VENTA") {
      return "bg-red-100 text-red-700";
    }
    if (t === "TRANSFERENCIA" || t === "TRANSFER") {
      return "bg-blue-100 text-blue-700";
    }
    if (t === "AJUSTE" || t === "ADJUSTMENT" || t === "ADJUSTMENT_IN" || t === "ADJUSTMENT_OUT") {
      return "bg-gray-100 text-gray-700";
    }
    return "bg-slate-100 text-slate-600";
  };

  const translateMovementType = (type) => {
    const t = (type || "").toUpperCase();
    const translations = {
      "ENTRADA": "ENTRADA",
      "ENTRY": "ENTRADA",
      "SALIDA": "SALIDA",
      "EXIT": "SALIDA",
      "SALE": "VENTA",
      "VENTA": "VENTA",
      "SALE_CANCEL": "ANULACION",
      "TRANSFER": "TRASLADO",
      "TRANSFERENCIA": "TRASLADO",
      "ADJUSTMENT": "AJUSTE",
      "AJUSTE": "AJUSTE",
      "ADJUSTMENT_IN": "AJUSTE +",
      "ADJUSTMENT_OUT": "AJUSTE -",
      "PURCHASE": "COMPRA",
    };
    return translations[t] || t;
  };

  const dataWithBalance = React.useMemo(() => {
    if (!product || !branch) return data.map(m => ({ ...m, balance: null }));
    
    const sorted = [...data].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    let runningBalance = 0;
    const withBalance = sorted.map(m => {
      const qty = Number(m.qty || m.quantity || 0);
      const type = (m.movement_type || "").toUpperCase();
      
      const isEntrada =
        type === "ENTRADA" || type === "ENTRY" || type === "SALE_CANCEL" ||
        type === "PURCHASE" || type === "ADJUSTMENT_IN";
      
      if (isEntrada) {
        runningBalance += Math.abs(qty);
      } else {
        runningBalance -= Math.abs(qty);
      }
      
      return { ...m, balance: runningBalance };
    });
    
    return withBalance.sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
  }, [data, product, branch]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-[11px] text-green-700 uppercase">Entradas</p>
          <p className="text-green-900 font-bold text-lg">{totals.entradas}</p>
          <p className="text-[10px] text-green-600">{formatCurrency(totals.costoEntradas)}</p>
        </div>

        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-[11px] text-red-700 uppercase">Salidas</p>
          <p className="text-red-900 font-bold text-lg">{totals.salidas}</p>
          <p className="text-[10px] text-red-600">{formatCurrency(totals.costoSalidas)}</p>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-[11px] text-blue-700 uppercase">Balance Neto</p>
          <p className={`font-bold text-lg ${totals.entradas - totals.salidas >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
            {totals.entradas - totals.salidas >= 0 ? '+' : ''}{totals.entradas - totals.salidas}
          </p>
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <p className="text-[11px] text-purple-700 uppercase">Costo Salidas</p>
          <p className="text-purple-900 font-bold text-lg">{formatCurrency(totals.costoSalidas)}</p>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-[11px] text-amber-700 uppercase">Movimientos</p>
          <p className="text-amber-900 font-bold text-lg">{data.length}</p>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {data.length === 0 && (
          <p className="text-center text-slate-400 py-8">No hay movimientos.</p>
        )}
        {dataWithBalance.map((m) => {
          const qty = Number(m.qty || m.quantity || 0);
          const cost = Number(m.cost_unit || m.cost || 0);
          const total = Number(m.total_cost || m.total || qty * cost);

          return (
            <div key={m.id} className="bg-white border rounded-lg p-3 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded text-[10px] font-semibold ${getTypeColor(m.movement_type)}`}>
                  {translateMovementType(m.movement_type)}
                </span>
                <span className="text-[10px] text-slate-500">{formatShortDate(m.created_at)}</span>
              </div>
              
              <p className="font-semibold text-sm truncate">{m.product_name || "-"}</p>
              
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div>
                  <p className="text-slate-500">Cantidad</p>
                  <p className="font-bold">{qty}</p>
                </div>
                <div>
                  <p className="text-slate-500">Costo</p>
                  <p className="font-medium">{formatCurrency(cost)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total</p>
                  <p className="font-medium">{formatCurrency(total)}</p>
                </div>
              </div>

              {m.reference && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-[10px] text-slate-500">Referencia</p>
                  <p className="text-xs text-blue-600 font-medium">{m.reference}</p>
                </div>
              )}

              {m.balance !== null && (
                <div className="mt-2 pt-2 border-t flex justify-between items-center">
                  <span className="text-[10px] text-slate-500">Stock despues:</span>
                  <span className="font-bold text-emerald-600">{m.balance}</span>
                </div>
              )}

              <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                <span>{m.from_branch_name || m.to_branch_name || "-"}</span>
                <span>{m.user_full_name || m.user_email || "-"}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-auto border rounded-xl bg-white">
        <table className="w-full text-xs">
          <thead className="bg-slate-100 text-slate-600 uppercase">
            <tr>
              <th className="p-2 text-left">Fecha</th>
              <th className="p-2 text-left">Movimiento</th>
              <th className="p-2 text-left">Producto</th>
              <th className="p-2 text-right">Cantidad</th>
              <th className="p-2 text-right">Costo</th>
              <th className="p-2 text-right">Total</th>
              {product && branch && <th className="p-2 text-right">Balance</th>}
              <th className="p-2 text-left">Sucursal</th>
              <th className="p-2 text-left">Referencia</th>
              <th className="p-2 text-left">Usuario</th>
            </tr>
          </thead>

          <tbody>
            {data.length === 0 && (
              <tr>
                <td colSpan={product && branch ? 10 : 9} className="p-4 text-center text-slate-400">
                  No hay movimientos.
                </td>
              </tr>
            )}

            {dataWithBalance.map((m) => {
              const qty = Number(m.qty || m.quantity || 0);
              const cost = Number(m.cost_unit || m.cost || 0);
              const total = Number(m.total_cost || m.total || qty * cost);
              const branchName = m.from_branch_name || m.to_branch_name || "-";

              return (
                <tr key={m.id} className="border-b last:border-none hover:bg-slate-50">
                  <td className="p-2">{formatKardexDateTime(m.created_at)}</td>

                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-semibold ${getTypeColor(m.movement_type)}`}>
                      {translateMovementType(m.movement_type)}
                    </span>
                  </td>

                  <td className="p-2 font-medium">{m.product_name || "-"}</td>

                  <td className="p-2 text-right font-semibold">{qty}</td>

                  <td className="p-2 text-right">{formatCurrency(cost)}</td>

                  <td className="p-2 text-right">{formatCurrency(total)}</td>

                  {product && branch && (
                    <td className="p-2 text-right font-bold text-emerald-600">
                      {m.balance !== null ? m.balance : "-"}
                    </td>
                  )}

                  <td className="p-2">{branchName}</td>

                  <td className="p-2">
                    {m.reference ? (
                      <span className="text-blue-600 font-medium">{m.reference}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="p-2 text-slate-700">
                    {m.user_full_name || m.user_email || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className={`px-4 py-2 text-xs rounded-lg border ${
            page === 0
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-slate-100"
          }`}
        >
          Anterior
        </button>

        <p className="text-xs text-slate-500">Pagina {page + 1}</p>

        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={data.length < limit}
          className={`px-4 py-2 text-xs rounded-lg border ${
            data.length < limit
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white hover:bg-slate-100"
          }`}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
