"use client";

import React, { useState } from "react";
import OpportunityCard from "./OpportunityCard.jsx";
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

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e, targetStageId) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedOpportunity && draggedOpportunity.stage_id !== targetStageId) {
      await onMoveOpportunity(draggedOpportunity.id, targetStageId);
    }

    setDraggedOpportunity(null);
  };

  if (!pipelineData || pipelineData.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        No hay etapas configuradas. Crea las etapas en Supabase primero.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {pipelineData.map(({ stage, opportunities, totalAmount, count }) => {
          const colors = getStageColor(stage.color);
          const isDropTarget = dragOverStage === stage.id;
          const isWonStage = stage.code === "ganado";
          const isLostStage = stage.code === "perdido";

          return (
            <div
              key={stage.id}
              className={`w-72 flex-shrink-0 rounded-lg border-2 transition-all ${
                isDropTarget
                  ? `${colors.border} border-dashed bg-opacity-50 ${colors.bg}`
                  : "border-slate-200 bg-slate-50"
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className={`px-3 py-2 rounded-t-lg ${colors.header}`}>
                <div className="flex justify-between items-center">
                  <h3 className={`text-sm font-semibold ${colors.text}`}>
                    {stage.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                    {count}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  C$ {totalAmount.toLocaleString("es-NI")}
                </p>
              </div>

              <div className="p-2 space-y-2 min-h-[200px] max-h-[500px] overflow-y-auto">
                {opportunities.length === 0 ? (
                  <div className="text-center py-4 text-xs text-slate-400">
                    {isDropTarget ? "Soltar aquí" : "Sin oportunidades"}
                  </div>
                ) : (
                  opportunities.map((opp) => (
                    <OpportunityCard
                      key={opp.id}
                      opportunity={opp}
                      stageColor={stage.color}
                      isDragging={draggedOpportunity?.id === opp.id}
                      onDragStart={(e) => handleDragStart(e, opp)}
                      onDragEnd={handleDragEnd}
                      onEdit={() => onEditOpportunity(opp)}
                      onDelete={() => {
                        if (confirm("¿Eliminar esta oportunidad?")) {
                          onDeleteOpportunity(opp.id);
                        }
                      }}
                      onAddActivity={() => onAddActivity(opp)}
                      onMarkWon={isWonStage ? null : () => onMarkWon(opp.id)}
                      onMarkLost={isLostStage ? null : () => {
                        const reason = prompt("Razón de pérdida:");
                        if (reason) onMarkLost(opp.id, reason);
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}