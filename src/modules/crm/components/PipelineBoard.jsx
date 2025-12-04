"use client";

import React, { useState } from "react";
import OpportunityCard from "./OpportunityCard";
import { getStageColor } from "../services/crmConfig";

export default function PipelineBoard({
  pipelineData,
  onMoveOpportunity,
  onEditOpportunity,
  onDeleteOpportunity,
  onAddActivity,
  onMarkWon,
  onMarkLost,
}) {
  const [draggedOpportunity, setDraggedOpportunity] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  /* ============================================================
     DRAG & DROP HANDLERS
  ============================================================ */
  const handleDragStart = (e, opportunity) => {
    setDraggedOpportunity(opportunity);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", opportunity.id);
  };

  const handleDragEnd = () => {
    setDraggedOpportunity(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverStage(stageId);
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedOpportunity && draggedOpportunity.stage_id !== targetStageId) {
      await onMoveOpportunity(draggedOpportunity.id, targetStageId);
    }

    setDraggedOpportunity(null);
  };

  /* ============================================================
     UI
  ============================================================ */
  if (!pipelineData || pipelineData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay etapas configuradas. Crea las etapas en Supabase primero.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      {/* CONTENEDOR TIPO MONDAY — COLUMNAS CON SEPARACIÓN GRANDE */}
      <div className="flex gap-6 min-w-max px-2">

        {pipelineData.map(({ stage, opportunities, totalAmount, count }) => {
          const colors = getStageColor(stage.color);
          const isDropTarget = dragOverStage === stage.id;

          return (
            <div
              key={stage.id}
              /* CARD DE COLUMNA — ESTILO MONDAY */
              className={`
                w-80 flex-shrink-0 rounded-2xl
                bg-white shadow-[0_3px_8px_rgba(0,0,0,0.07)]
                border border-slate-100
                flex flex-col transition-all
                ${isDropTarget ? "ring-2 ring-blue-400 ring-offset-2 scale-[1.01]" : ""}
              `}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDrop={(e) => handleDrop(e, stage.id)}
            >

              {/* HEADER ESTILO MONDAY */}
              <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 text-sm">
                    {stage.name}
                  </h3>

                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700"
                  >
                    {count}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Total: C${totalAmount.toLocaleString("es-NI")}
                </p>
              </div>

              {/* OPORTUNIDADES */}
              <div className="p-3 space-y-3 min-h-[260px] max-h-[600px] overflow-y-auto">

                {opportunities.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400 italic">
                    {isDropTarget ? "Soltar aquí…" : "Sin oportunidades"}
                  </div>
                )}

                {/* RENDER CARDS — ESTILO MONDAY */}
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, opp)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all duration-200 ${
                      draggedOpportunity?.id === opp.id ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <OpportunityCard
                      opportunity={opp}
                      stageColor={stage.color}
                      onEdit={() => onEditOpportunity(opp)}
                      onDelete={() => {
                        if (confirm("¿Eliminar esta oportunidad?")) onDeleteOpportunity(opp.id);
                      }}
                      onAddActivity={() => onAddActivity(opp)}
                      onMarkWon={() => onMarkWon(opp.id)}
                      onMarkLost={() => {
                        const reason = prompt("Razón de pérdida:");
                        if (reason) onMarkLost(opp.id, reason);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* FOOTER — BOTÓN AÑADIR OPORTUNIDAD */}
              <div className="bg-slate-50 p-3 border-t border-slate-200 rounded-b-2xl">
                <button
                  className="w-full py-2 text-xs font-medium rounded-lg bg-white hover:bg-slate-100
                             border border-slate-300 text-slate-700 transition"
                  onClick={() => onEditOpportunity(null, stage.id)}
                >
                  + Añadir oportunidad
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
