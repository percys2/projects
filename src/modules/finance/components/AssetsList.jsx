"use client";

import React from "react";

export default function AssetsList({ assets, onEdit, onDelete }) {
  const safeAssets = Array.isArray(assets) ? assets : [];

  function calculateDepreciation(asset) {
    if (!asset.acquisition_date || !asset.acquisition_cost || !asset.useful_life_months) {
      return { accumulated: 0, bookValue: asset.acquisition_cost || 0 };
    }

    const acquisitionDate = new Date(asset.acquisition_date);
    const now = new Date();
    const monthsElapsed = Math.max(
      0,
      (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
        (now.getMonth() - acquisitionDate.getMonth())
    );

    const depreciableAmount = (asset.acquisition_cost || 0) - (asset.salvage_value || 0);
    const monthlyDepreciation = depreciableAmount / asset.useful_life_months;
    const accumulated = Math.min(
      monthlyDepreciation * monthsElapsed,
      depreciableAmount
    );
    const bookValue = (asset.acquisition_cost || 0) - accumulated;

    return { accumulated, bookValue, monthlyDepreciation };
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b text-xs uppercase text-slate-500">
            <th className="px-3 py-2 text-left">Nombre</th>
            <th className="px-3 py-2 text-left">Categoría</th>
            <th className="px-3 py-2 text-left">Fecha Adquisición</th>
            <th className="px-3 py-2 text-right">Costo</th>
            <th className="px-3 py-2 text-right">Vida Útil</th>
            <th className="px-3 py-2 text-right">Depr. Acumulada</th>
            <th className="px-3 py-2 text-right">Valor en Libros</th>
            <th className="px-3 py-2 text-left">Estado</th>
            <th className="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {safeAssets.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-slate-400">
                No hay activos fijos registrados
              </td>
            </tr>
          ) : (
            safeAssets.map((asset) => {
              const { accumulated, bookValue } = calculateDepreciation(asset);
              return (
                <tr key={asset.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{asset.name}</td>
                  <td className="px-3 py-2">{asset.category || "-"}</td>
                  <td className="px-3 py-2">{asset.acquisition_date}</td>
                  <td className="px-3 py-2 text-right">
                    C$ {asset.acquisition_cost?.toLocaleString("es-NI")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {asset.useful_life_months} meses
                  </td>
                  <td className="px-3 py-2 text-right text-orange-600">
                    C$ {accumulated.toLocaleString("es-NI", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-blue-600">
                    C$ {bookValue.toLocaleString("es-NI", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        asset.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {asset.status === "active" ? "Activo" : "Dado de baja"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => onEdit && onEdit(asset)}
                        className="px-2 py-1 text-xs bg-slate-800 text-white rounded hover:bg-slate-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => onDelete && onDelete(asset.id)}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
