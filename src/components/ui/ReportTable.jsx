"use client";

import React from "react";

export default function ReportTable({
  columns,
  data,
  footer,
  emptyMessage = "No hay datos",
  className = "",
}) {
  return (
    <table className={`min-w-full text-sm ${className}`}>
      <thead>
        <tr className="bg-slate-50 border-b text-xs uppercase text-slate-600">
          {columns.map((col, idx) => (
            <th
              key={idx}
              className={`px-4 py-2 ${col.align === "right" ? "text-right" : "text-left"}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-4 text-center text-slate-400">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b hover:bg-slate-50">
              {columns.map((col, colIdx) => (
                <td
                  key={colIdx}
                  className={`px-4 py-2 ${col.align === "right" ? "text-right" : ""} ${col.className || ""}`}
                >
                  {col.render ? col.render(row, rowIdx) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
      {footer && (
        <tfoot>
          <tr className="bg-slate-100 font-semibold">
            {footer.map((cell, idx) => (
              <td
                key={idx}
                className={`px-4 py-2 ${cell.align === "right" ? "text-right" : ""} ${cell.className || ""}`}
                colSpan={cell.colSpan || 1}
              >
                {cell.value}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}