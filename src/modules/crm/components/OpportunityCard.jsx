"use client";

import React from "react";

export default function OpportunityCard({
  opportunity,
  stageColor,
  isDragging,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  onAddActivity,
  onMarkWon,
  onMarkLost,
}) {
  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Hace ${Math.abs(diffDays)}d`, urgent: true };
    if (diffDays === 0) return { text: "Hoy", urgent: true };
    if (diffDays <= 7) return { text: `En ${diffDays}d`, urgent: false };
    return { text: date.toLocaleDateString("es-NI", { day: "2-digit", month: "short" }), urgent: false };
  };

  const closeDate = formatDate(opportunity.expected_close_date);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-lg border shadow-sm p-3 cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : "hover:shadow-md"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-sm font-medium text-slate-800 line-clamp-1">
          {opportunity.name}
        </h4>
        <div className="flex gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="text-slate-400 hover:text-slate-600 text-xs"
            title="Editar"
          >
            ✏️
          </button>
        </div>
      </div>

      {opportunity.client_name && (
        <p className="text-xs text-slate-500 mb-2">
          👤 {opportunity.client_name}
        </p>
      )}

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-emerald-600">
          C$ {(opportunity.amount || 0).toLocaleString("es-NI")}
        </span>
        {closeDate && (
          <span
            className={`text-xs px-2 py-0.5 rounded ${
              closeDate.urgent ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            📅 {closeDate.text}
          </span>
        )}
      </div>

      {opportunity.source && (
        <p className="text-xs text-slate-400 mb-2">Fuente: {opportunity.source}</p>
      )}

      <div className="flex gap-1 mt-2 pt-2 border-t">
        <button
          onClick={(e) => { e.stopPropagation(); onAddActivity(); }}
          className="flex-1 text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          title="Agregar actividad"
        >
          + Actividad
        </button>
        {onMarkWon && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkWon(); }}
            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100"
            title="Marcar como ganado"
          >
            ✓
          </button>
        )}
        {onMarkLost && (
          <button
            onClick={(e) => { e.stopPropagation(); onMarkLost(); }}
            className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
            title="Marcar como perdido"
          >
            ✗
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-xs px-2 py-1 bg-slate-50 text-slate-600 rounded hover:bg-slate-100"
          title="Eliminar"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}