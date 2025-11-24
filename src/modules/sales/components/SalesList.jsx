import React from "react";
import { formatDate } from "@/src/lib/utils/formatDate";

export default function SalesList({ sales, onEdit, onDelete }) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No hay ventas registradas</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left text-xs text-slate-600">
            <th className="pb-2 font-medium">Fecha</th>
            <th className="pb-2 font-medium">Factura</th>
            <th className="pb-2 font-medium">Cliente</th>
            <th className="pb-2 font-medium">Producto</th>
            <th className="pb-2 font-medium text-right">Cantidad</th>
            <th className="pb-2 font-medium text-right">Subtotal</th>
            <th className="pb-2 font-medium text-right">Margen</th>
            <th className="pb-2 font-medium text-right">%</th>
            <th className="pb-2 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((sale) => (
            <tr key={sale.id} className="border-b hover:bg-slate-50">
              <td className="py-3 text-sm">
                {sale.fecha ? formatDate(sale.fecha) : "-"}
              </td>
              <td className="py-3 text-sm">{sale.factura || "-"}</td>
              <td className="py-3 text-sm">{sale.nombre || "-"}</td>
              <td className="py-3 text-sm">{sale.descripcion || "-"}</td>
              <td className="py-3 text-sm text-right">{sale.cantidad || 0}</td>
              <td className="py-3 text-sm text-right font-medium">
                C$ {(sale.subtotal || 0).toFixed(2)}
              </td>
              <td className="py-3 text-sm text-right text-green-600">
                C$ {(sale.margen || 0).toFixed(2)}
              </td>
              <td className="py-3 text-sm text-right">
                {((sale.porcentaje || 0) * 100).toFixed(1)}%
              </td>
              <td className="py-3 text-sm text-right">
                <button
                  onClick={() => onEdit(sale)}
                  className="text-blue-600 hover:text-blue-800 mr-3 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(sale.id)}
                  className="text-red-600 hover:text-red-800 text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
