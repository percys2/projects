
"use client";

import React, { useState } from "react";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getClientName, getProductNames, getItemsCount } from "../utils/salePresenters";

export default function SalesMobileList({ sales, branches, loading, error, onPrint, onCancel, onDelete, onViewDetail }) {
  const [expandedSaleId, setExpandedSaleId] = useState(null);

  const toggleExpand = (saleId) => {
    setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
  };

  if (loading) return <p className="text-center py-8 text-slate-500">Cargando ventas...</p>;
  if (error) return <p className="text-center py-8 text-red-500">Error: {error}</p>;
  if (sales.length === 0) return <p className="text-center py-8 text-slate-400">No hay ventas</p>;

  return (
    <div className="lg:hidden space-y-2">
      {sales.map((sale) => (
        <div key={sale.id} className="bg-white border rounded-lg p-3 shadow-sm" onClick={() => toggleExpand(sale.id)}>
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{sale.factura || sale.id.slice(0, 8)}</p>
              <p className="text-xs text-slate-500 truncate">{getClientName(sale)}</p>
              <p className="text-xs text-slate-400">{formatDateTime(sale.fecha || sale.created_at)} {sale.user_name ? `- ${sale.user_name}` : ""}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-sm text-emerald-600">{formatCurrency(sale.total)}</p>
              <p className="text-[10px] text-slate-400">{getItemsCount(sale)} items</p>
            </div>
          </div>
          {expandedSaleId === sale.id && (
            <div className="mt-3 pt-3 border-t space-y-2">
              <div className="text-xs text-slate-600 mb-2"><strong>Productos:</strong> {getProductNames(sale, 5)}</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>Subtotal: <strong>{formatCurrency(sale.subtotal)}</strong></div>
                <div>Descuento: <strong>{formatCurrency(sale.descuento)}</strong></div>
                <div>Margen: <strong>{formatCurrency(sale.margen)}</strong></div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={(e) => { e.stopPropagation(); onViewDetail(sale); }} className="flex-1 px-2 py-2 text-xs bg-slate-600 text-white rounded">Ver Detalle</button>
                <button onClick={(e) => { e.stopPropagation(); onPrint(sale); }} className="flex-1 px-2 py-2 text-xs bg-blue-600 text-white rounded">Imprimir</button>
                <button onClick={(e) => { e.stopPropagation(); onCancel(sale.id); }} className="flex-1 px-2 py-2 text-xs bg-orange-600 text-white rounded">Anular</button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(sale.id); }} className="flex-1 px-2 py-2 text-xs bg-red-600 text-white rounded">Eliminar</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}