"use client";

import React from "react";

export default function SalesExportButtons({ onExportCsv, onExportExcel, onExportPdf }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={onExportCsv} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        CSV
      </button>
      <button onClick={onExportExcel} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Excel
      </button>
      <button onClick={onExportPdf} className="flex-1 sm:flex-none px-3 py-2 text-xs sm:text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg flex items-center justify-center gap-1 min-h-[40px]">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        PDF
      </button>
    </div>
  );
}