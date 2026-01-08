"use client";

import React from "react";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { getClientName, getBranchName } from "../utils/salePresenters";

export default function SaleDetailModal({ sale, branches, onClose, onPrint, onCancel, onDelete }) {
  if (!sale) return null;

  const items = sale.sales_items || [];
  const subtotal = items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const totalCost = items.reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.quantity)), 0);
  const margin = subtotal - totalCost;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Detalle de Venta</h2>
            <p className="text-sm text-slate-300">Factura: {sale.factura || sale.id?.slice(0, 8)}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Fecha</p>
              <p className="font-medium">{formatDateTime(sale.fecha || sale.created_at)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Sucursal</p>
              <p className="font-medium">{getBranchName(sale, branches)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Cliente</p>
              <p className="font-medium">{getClientName(sale)}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Vendedor</p>
              <p className="font-medium">{sale.user_name || "-"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Metodo de Pago</p>
              <p className="font-medium capitalize">{sale.payment_method || "Efectivo"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg">
              <p className="text-slate-500 text-xs mb-1">Estado</p>
              <p className="font-medium text-green-600">Completada</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Productos ({items.length})</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left p-2 font-medium text-slate-600">Producto</th>
                    <th className="text-center p-2 font-medium text-slate-600">Cant.</th>
                    <th className="text-right p-2 font-medium text-slate-600">Precio</th>
                    <th className="text-right p-2 font-medium text-slate-600">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id || index} className="border-t">
                      <td className="p-2">
                        <p className="font-medium">{item.products?.name || "Producto"}</p>
                        <p className="text-xs text-slate-500">{item.products?.sku || ""}</p>
                      </td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            {sale.descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Descuento:</span>
                <span className="font-medium text-red-600">-{formatCurrency(sale.descuento)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Costo Total:</span>
              <span className="font-medium">{formatCurrency(totalCost)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Margen:</span>
              <span className={`font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(margin)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-emerald-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          {sale.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">Notas:</p>
              <p className="text-sm text-yellow-800">{sale.notes}</p>
            </div>
          )}
        </div>

        <div className="border-t p-4 flex flex-wrap gap-2 justify-end bg-slate-50">
          <button
            onClick={() => { onPrint(sale); onClose(); }}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Imprimir
          </button>
          <button
            onClick={() => { onCancel(sale.id); onClose(); }}
            className="px-4 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Anular
          </button>
          <button
            onClick={() => { onDelete(sale.id); onClose(); }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Eliminar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
