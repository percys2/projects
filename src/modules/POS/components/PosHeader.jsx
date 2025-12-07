"use client";

import { useState } from "react";
import { useBranchStore } from "../store/useBranchStore";
import { useCashRegisterStore } from "../store/useCashRegisterStore";

export default function PosHeader({ onCartClick, showCart }) {
  const branches = useBranchStore((s) => s.branches);
  const activeBranch = useBranchStore((s) => s.activeBranch);
  const setBranch = useBranchStore((s) => s.setBranch);

  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const openCashRegister = useCashRegisterStore((s) => s.openCashRegister);
  const closeCashRegister = useCashRegisterStore((s) => s.closeCashRegister);
  const getTotal = useCashRegisterStore((s) => s.getTotal);

  const [showOpenModal, setShowOpenModal] = useState(false);
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
    const total = getTotal();
    if (confirm(`Cerrar caja? Total en caja: C$ ${total.toLocaleString("es-NI")}`)) {
      closeCashRegister();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 bg-white p-3 rounded-lg border shadow-sm">
        {/* Left side - Title and status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <h1 className="text-lg font-semibold">Punto de Venta</h1>
          
          {/* Estado de caja */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium w-fit ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
            {isOpen ? "Caja Abierta" : "Caja Cerrada"}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Boton Abrir/Cerrar Caja */}
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

          {/* Selector de sucursal */}
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

      {/* Modal para abrir caja */}
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
    </>
  );
}