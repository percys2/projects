"use client";

import React from "react";
import {
  PencilIcon,
  TrashIcon,
  ChatBubbleOvalLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function OpportunityCard({
  opportunity,
  stageColor,
  onEdit,
  onDelete,
  onAddActivity,
  onMarkWon,
  onMarkLost,
  onDragStart,
  onDragEnd,
  isDragging,
}) {
  const probability = opportunity.stage_probability || 0;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`
        bg-white rounded-xl border shadow-[0_2px_6px_rgba(0,0,0,0.06)]
        p-3 cursor-grab transition-all select-none
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
        active:cursor-grabbing
        ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"}
      `}
    >
      {/* BARRA LATERAL DE COLOR */}
      <div
        className="w-1 h-full absolute left-0 top-0 rounded-l-xl"
        style={{ backgroundColor: stageColor }}
      />

      {/* TITULO + MONTO */}
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-sm text-slate-800 leading-tight">
          {opportunity.title}
        </h3>

        <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
          C${Number(opportunity.amount).toLocaleString("es-NI")}
        </span>
      </div>

      {/* CLIENTE */}
      <p className="text-xs text-slate-500 mb-2">
        {opportunity.client_name || "— Sin cliente —"}
      </p>

      {/* PROBABILIDAD Y PROGRESO */}
      <div className="mb-2">
        <div className="flex justify-between text-[11px] text-slate-500 font-medium mb-1">
          <span>Probabilidad</span>
          <span>{probability}%</span>
        </div>

        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${probability}%`,
              backgroundColor: stageColor,
            }}
          />
        </div>
      </div>

      {/* BOTONES DE ACCIONES */}
      <div className="flex justify-between items-center mt-3">

        {/* ACTIVIDADES */}
        <button
          onClick={onAddActivity}
          className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1"
        >
          <ChatBubbleOvalLeftIcon className="h-4 w-4" />
          Actividad
        </button>

        {/* ACCIONES DERECHA */}
        <div className="flex items-center gap-2">

          <button
            className="p-1 hover:bg-slate-100 rounded"
            onClick={onEdit}
          >
            <PencilIcon className="h-4 w-4 text-slate-600" />
          </button>

          <button
            className="p-1 hover:bg-slate-100 rounded"
            onClick={onDelete}
          >
            <TrashIcon className="h-4 w-4 text-red-500" />
          </button>

          {/* GANAR */}
          {onMarkWon && (
            <button
              className="p-1 hover:bg-green-50 rounded"
              onClick={onMarkWon}
            >
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </button>
          )}

          {/* PERDER */}
          {onMarkLost && (
            <button
              className="p-1 hover:bg-red-50 rounded"
              onClick={onMarkLost}
            >
              <XCircleIcon className="h-5 w-5 text-red-600" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
