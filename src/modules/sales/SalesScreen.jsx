"use client";

import React, { useState } from "react";
import { useSales } from "./hooks/useSales";
import {
  SalesKpiCards,
  SalesFilters,
  SalesTable,
  SalesMobileList,
  SalesPagination,
  SalesExportButtons,
} from "./components";
import {
  exportSalesToPdf,
  exportSalesToExcel,
  exportSalesToCsv,
  printSaleInvoice,
} from "./utils/exports";
import CashClosingHistory from "../POS/components/CashClosingHistory";

export default function SalesScreen({ orgSlug }) {
  const [showCashHistory, setShowCashHistory] = useState(false);
  const {
    filteredSales,
    totals,
    loading,
    error,
    branches,
    filters,
    page,
    limit,
    updateFilter,
    clearFilters,
    nextPage,
    prevPage,
    cancelSale,
    ConfirmDialog,
  } = useSales(orgSlug);

  const handleExportPdf = () => {
    exportSalesToPdf({
      sales: filteredSales,
      totals,
      filters,
      branches,
    });
  };

  const handleExportExcel = () => {
    exportSalesToExcel({
      sales: filteredSales,
      totals,
      filters,
      branches,
    });
  };

  const handleExportCsv = () => {
    exportSalesToCsv({
      sales: filteredSales,
      branches,
    });
  };

  const handlePrintInvoice = (sale) => {
    printSaleInvoice(sale, branches);
  };

  const handleCancelSale = (saleId) => {
    cancelSale(saleId, true);
  };

  const handleDeleteSale = (saleId) => {
    cancelSale(saleId, false);
  };

  const hasMorePages = filteredSales.length >= limit;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Ventas</h1>
          <p className="text-xs sm:text-sm text-slate-500">Historial de ventas del POS</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCashHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Cierres de Caja
          </button>
          <SalesExportButtons
            onExportCsv={handleExportCsv}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
          />
        </div>
      </div>

      <SalesKpiCards totals={totals} transactionCount={filteredSales.length} />

      <SalesFilters
        filters={filters}
        branches={branches}
        onFilterChange={updateFilter}
        onClearFilters={clearFilters}
      />

      <SalesMobileList
        sales={filteredSales}
        loading={loading}
        error={error}
        onPrint={handlePrintInvoice}
        onCancel={handleCancelSale}
        onDelete={handleDeleteSale}
      />

      <SalesTable
        sales={filteredSales}
        branches={branches}
        loading={loading}
        error={error}
        onPrint={handlePrintInvoice}
        onCancel={handleCancelSale}
        onDelete={handleDeleteSale}
      />

      <SalesPagination
        page={page}
        hasMore={hasMorePages}
        onPrevPage={prevPage}
        onNextPage={nextPage}
      />

      {showCashHistory && (
        <CashClosingHistory
          orgSlug={orgSlug}
          onClose={() => setShowCashHistory(false)}
        />
      )}

      {ConfirmDialog}
    </div>
  );
}