"use client";

import React from "react";

export default function SalesPagination({ page, hasMore, onPrevPage, onNextPage }) {
  return (
    <div className="flex justify-center gap-2">
      <button onClick={onPrevPage} disabled={page === 0} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]">Anterior</button>
      <span className="px-4 py-2 text-sm flex items-center">Pagina {page + 1}</span>
      <button onClick={onNextPage} disabled={!hasMore} className="px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-50 min-h-[44px]">Siguiente</button>
    </div>
  );
}
