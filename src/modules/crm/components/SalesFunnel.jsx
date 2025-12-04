"use client";

import React from "react";
import { getStageColor } from "../services/crmConfig";

export default function SalesFunnel({ pipelineData }) {
  if (!pipelineData || pipelineData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay datos para mostrar el embudo
      </div>
    );
  }

  const maxCount = Math.max(...pipelineData.map((d) => d.count), 1);
  const totalValue = pipelineData.reduce((sum, d) => sum + d.totalAmount, 0);
  const totalCount = pipelineData.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-slate-800">{totalCount}</p>
          <p className="text-xs text-slate-500">Oportunidades totales</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <p className="text-3xl font-bold text-emerald-600">
            C$ {totalValue.toLocaleString("es-NI")}
          </p>
          <p className="text-xs text-emerald-600">Valor total pipeline</p>
        </div>
      </div>

      <div className="space-y-3">
        {pipelineData.map(({ stage, count, totalAmount }) => {
          const colors = getStageColor(stage.color);
          const widthPercent = Math.max((count / maxCount) * 100, 5);
          const conversionRate = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;

          return (
            <div key={stage.id} className="relative">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right">
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {stage.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {Math.round(stage.probability * 100)}% prob.
                  </p>
                </div>

                <div className="flex-1 relative">
                  <div className="h-10 bg-slate-100 rounded-lg overflow-hidden">
                    <div
                      className={`h-full ${colors.header} transition-all duration-500 flex items-center justify-end pr-3`}
                      style={{ width: `${widthPercent}%` }}
                    >
                      {widthPercent > 20 && (
                        <span className={`text-xs font-medium ${colors.text}`}>
                          {count} ({conversionRate}%)
                        </span>
                      )}
                    </div>
                  </div>
                  {widthPercent <= 20 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                      {count} ({conversionRate}%)
                    </span>
                  )}
                </div>

                <div className="w-32 text-right">
                  <p className="text-sm font-semibold text-emerald-600">
                    C$ {totalAmount.toLocaleString("es-NI")}
                  </p>
                  <p className="text-xs text-slate-400">
                    Ponderado: C$ {Math.round(totalAmount * stage.probability).toLocaleString("es-NI")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
        <h4 className="text-sm font-semibold text-indigo-700 mb-2">
          Valor Ponderado del Pipeline
        </h4>
        <p className="text-2xl font-bold text-indigo-600">
          C$ {pipelineData.reduce((sum, d) => sum + (d.totalAmount * d.stage.probability), 0).toLocaleString("es-NI")}
        </p>
        <p className="text-xs text-indigo-500 mt-1">
          Basado en la probabilidad de cierre de cada etapa
        </p>
      </div>
    </div>
  );
}