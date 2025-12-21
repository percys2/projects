"use client";

import { useState } from "react";
import { useBranchStore } from "../store/useBranchStore";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import CashClosingHistory from "./CashClosingHistory";
import CloseCashModal from "./CloseCashModal";
import DailySalesDetail from "./DailySalesDetail";
import CashClosingReport from "./CashClosingReport";

export default function PosHeader({ onCartClick, showCart, orgSlug }) {
  const branches = useBranchStore((s) => s.branches);
  const activeBranch = useBranchStore((s) => s.activeBranch);
  const setBranch = useBranchStore((s) => s.setBranch);

  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const openCashRegister = useCashRegisterStore((s) => s.openCashRegister);
  const closeCashRegister = useCashRegisterStore((s) => s.closeCashRegister);
  const getTotals = useCashRegisterStore((s) => s.getTotals);
  const openingTime = useCashRegisterStore((s) => s.openingTime);
  const movements = useCashRegisterStore((s) => s.movements);

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDailyDetail, setShowDailyDetail] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");

  const handleOpenCash = () => {
    const amount = parseFloat(openingAmount) || 0;
    openCashRegister({
      amount,
      user: "Cajero",
      branch: activeBranch,
    });
    setShowOpenModal(false);
    setOpeningAmount("");
  };

  const handleCloseCash = () => {
    setShowCloseModal(true);
  };

  const handleCloseComplete = async (closingData) => {
    const record = closeCashRegister({
      countedAmount: closingData.countedAmount,
      notes: closingData.notes,
    });

    try {
      await fetch("/api/pos/cash-closings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          branch_id: activeBranch,
          user_name: "Cajero",
          opening_time: openingTime,
          closing_time: new Date().toISOString(),
          opening_amount: record.openingAmount,
          total_entries: record.totalEntradas,
          total_exits: record.totalSalidas,
          expected_total: record.expectedTotal,
          counted_amount: record.countedAmount,
          difference: record.difference,
          sales_count: record.salesCount,
          movements_count: movements.length,
          notes: closingData.notes,
          movements: movements,
        }),
      });
    } catch (err) {
      console.error("Error saving closing to database:", err);
    }

    setShowCloseModal(false);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-lg font-semibold">Punto de Venta</h1>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
            {isOpen ? "Caja Abierta" : "Caja Cerrada"}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowDailyDetail(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 min-h-[44px] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="hidden sm:inline">Detalle del Dia</span>
            <span className="sm:hidden">Dia</span>
          </button>

          <button
            onClick={() => setShowHistory(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 min-h-[44px] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Cierres</span>
            <span className="sm:hidden">Cierres</span>
          </button>

          <button
            onClick={() => setShowReport(true)}
            className="flex-1 sm:flex-none px-3 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 min-h-[44px] flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="hidden sm:inline">Reporte</span>
            <span className="sm:hidden">Reporte</span>
          </button>

          {!isOpen ? (
            <button
              onClick={() => setShowOpenModal(true)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 min-h-[44px]"
            >
              Abrir Caja
            </button>
          ) : (
            <button
              onClick={handleCloseCash}
              className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 min-h-[44px]"
            >
              Cerrar Caja
            </button>
          )}

          <select
            className="flex-1 sm:flex-none text-sm border rounded px-3 py-2 min-h-[44px] min-w-[120px]"
            value={activeBranch || ""}
            onChange={(e) => setBranch(e.target.value)}
            disabled={branches.length === 0}
          >
            {branches.length === 0 ? (
              <option value="">Cargando...</option>
            ) : (
              branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Abrir Caja</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fondo inicial (C$)
                </label>
                <input
                  type="number"
                  value={openingAmount}
                  onChange={(e) => setOpeningAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full border rounded-lg px-3 py-3 text-lg"
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleOpenCash}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 min-h-[48px]"
                >
                  Abrir Caja
                </button>
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-lg font-medium hover:bg-slate-300 min-h-[48px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <CloseCashModal
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleCloseComplete}
        />
      )}

      {showHistory && (
        <CashClosingHistory
          orgSlug={orgSlug}
          onClose={() => setShowHistory(false)}
        />
      )}

      {showDailyDetail && (
        <DailySalesDetail
          orgSlug={orgSlug}
          onClose={() => setShowDailyDetail(false)}
        />
      )}

      {showReport && (
        <CashClosingReport
          orgSlug={orgSlug}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}