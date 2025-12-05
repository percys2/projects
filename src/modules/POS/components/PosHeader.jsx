"use client";

import { useState } from "react";
import { useBranchStore } from "../store/useBranchStore";
import { useCashRegisterStore } from "../store/useCashRegisterStore";

export default function PosHeader() {
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
    if (confirm(`¿Cerrar caja? Total en caja: C$ ${total.toLocaleString("es-NI")}`)) {
      closeCashRegister();
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Punto de Venta</h1>
          
          {/* Estado de caja */}
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-500" : "bg-red-500"}`}></span>
            {isOpen ? "Caja Abierta" : "Caja Cerrada"}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botón Abrir/Cerrar Caja */}
          {!isOpen ? (
            <button
              onClick={() => setShowOpenModal(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Abrir Caja
            </button>
          ) : (
            <button
              onClick={handleCloseCash}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
            >
              Cerrar Caja
            </button>
          )}

          {/* Selector de sucursal */}
          <select
            className="text-sm border rounded px-3 py-2"
            value={activeBranch}
            onChange={(e) => setBranch(e.target.value)}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal para abrir caja */}
      {showOpenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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
                  className="w-full border rounded-lg px-3 py-2 text-lg"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleOpenCash}
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-medium hover:bg-emerald-700"
                >
                  Abrir Caja
                </button>
                <button
                  onClick={() => setShowOpenModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300"
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
