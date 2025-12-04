"use client";

import React from "react";

export default function SuppliersList({ suppliers, onEdit, onDelete }) {
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">RUC/Cédula</th>
            <th className="px-3 py-2 text-left">Teléfono</th>
            <th className="px-3 py-2 text-left">Email</th>
            <th className="px-3 py-2 text-left">Dirección</th>
            <th className="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {safeSuppliers.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-slate-400">
                No hay proveedores registrados
              </td>
            </tr>
          ) : (
            safeSuppliers.map((supplier) => (
              <tr key={supplier.id} className="border-b hover:bg-slate-50">
                <td className="px-3 py-2 font-medium">{supplier.name}</td>
                <td className="px-3 py-2">{supplier.tax_id || "-"}</td>
                <td className="px-3 py-2">{supplier.phone || "-"}</td>
                <td className="px-3 py-2">{supplier.email || "-"}</td>
                <td className="px-3 py-2 max-w-xs truncate">{supplier.address || "-"}</td>
                <td className="px-3 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => onEdit && onEdit(supplier)}
                      className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(supplier.id)}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
