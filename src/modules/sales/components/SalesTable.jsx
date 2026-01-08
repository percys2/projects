"use client";

import React from "react";
import { formatCurrency, formatDate, formatDateTime } from "../utils/formatters";
import { getClientName, getBranchName, getProductNames } from "../utils/salePresenters";

export default function SalesTable({ sales, branches, loading, error, onPrint, onCancel, onDelete, onViewDetail }) {
  return (
    <div className="hidden lg:block bg-white rounded-xl border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase">
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Factura</th>
              <th className="px-4 py-3 text-left">Usuario</th>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Productos</th>
              <th className="px-4 py-3 text-left">Sucursal</th>
              <th className="px-4 py-3 text-right">Total</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-500">Cargando ventas...</td></tr>
            ) : error ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-red-500">Error: {error}</td></tr>
            ) : sales.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No hay ventas</td></tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id} className="border-b hover:bg-slate-50">
                  <td className="px-4 py-3">{formatDateTime(sale.fecha || sale.created_at)}</td>
                  <td className="px-4 py-3 font-medium">{sale.factura || "-"}</td>
                  <td className="px-4 py-3 text-slate-600">{sale.user_name || "-"}</td>
                  <td className="px-4 py-3">{getClientName(sale)}</td>
                  <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={getProductNames(sale, 10)}>{getProductNames(sale)}</td>
                  <td className="px-4 py-3 text-slate-600">{getBranchName(sale, branches)}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCurrency(sale.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => onViewDetail(sale)} className="px-2 py-1 text-xs bg-slate-600 text-white rounded">Ver</button>
                      <button onClick={() => onPrint(sale)} className="px-2 py-1 text-xs bg-blue-600 text-white rounded">Imprimir</button>
                      <button onClick={() => onCancel(sale.id)} className="px-2 py-1 text-xs bg-orange-600 text-white rounded">Anular</button>
                      <button onClick={() => onDelete(sale.id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">Eliminar</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}