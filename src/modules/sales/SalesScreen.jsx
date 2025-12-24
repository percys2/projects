"use client";

import React from "react";
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

export default function SalesScreen({ orgSlug }) {
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
        <SalesExportButtons
          onExportCsv={handleExportCsv}
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
        />
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
    </div>
  );
}