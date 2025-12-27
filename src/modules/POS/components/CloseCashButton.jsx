"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";

export default function CloseCashButton() {
  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const getTotals = useCashRegisterStore((s) => s.getTotals);
  const closeCashRegister = useCashRegisterStore((s) => s.closeCashRegister);
  const openingTime = useCashRegisterStore((s) => s.openingTime);
  const movements = useCashRegisterStore((s) => s.movements);

  const [showModal, setShowModal] = useState(false);
  const [countedAmount, setCountedAmount] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const totals = getTotals();
  const counted = parseFloat(countedAmount) || 0;
  const difference = counted - totals.expectedTotal;

  const handleClose = () => {
    if (!countedAmount) {
      alert("Debe ingresar el monto contado fisicamente");
      return;
    }

    closeCashRegister({ countedAmount: counted, notes });

    const diffText = difference === 0 
      ? "Sin diferencia" 
      : difference > 0 
        ? `Sobrante: C$ ${difference.toFixed(2)}`
        : `Faltante: C$ ${Math.abs(difference).toFixed(2)}`;

    alert(`Caja cerrada exitosamente.\n\nEsperado: C$ ${totals.expectedTotal.toFixed(2)}\nContado: C$ ${counted.toFixed(2)}\n${diffText}`);
    
    setShowModal(false);
    setCountedAmount("");
    setNotes("");
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-NI");
  };

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs"
      >
        Cerrar Caja
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-800 text-white p-4 rounded-t-xl">
              <h2 className="text-lg font-bold">Cierre de Caja</h2>
              <p className="text-sm text-slate-300">Cotejo y arqueo</p>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3 text-sm">
                <p className="text-slate-500">Apertura: {formatTime(openingTime)}</p>
                <p className="text-slate-500">Movimientos: {movements.length}</p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700 text-sm">Resumen del Sistema</h3>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-slate-600">Monto de apertura</span>
                  <span className="text-sm font-medium">{formatCurrency(totals.openingAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-green-600">+ Entradas (ventas)</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totals.totalEntradas)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-red-600">- Salidas (retiros)</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(totals.totalSalidas)}</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3">
                  <span className="font-bold text-blue-800">Total Esperado</span>
                  <span className="font-bold text-blue-800 text-lg">{formatCurrency(totals.expectedTotal)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-700 text-sm">Conteo Fisico</h3>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">C$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={countedAmount}
                    onChange={(e) => setCountedAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-300 rounded-lg text-lg font-bold focus:border-blue-500 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {countedAmount && (
                <div className={`p-4 rounded-lg ${difference === 0 || difference > 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${difference >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {difference === 0 ? "Sin diferencia" : difference > 0 ? "SOBRANTE" : "FALTANTE"}
                    </span>
                    <span className={`text-xl font-bold ${difference >= 0 ? "text-green-700" : "text-red-700"}`}>
                      {difference === 0 ? "-" : formatCurrency(Math.abs(difference))}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 text-sm">Notas</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observaciones del cierre..."
                  className="w-full p-3 border rounded-lg text-sm resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowModal(false); setCountedAmount(""); setNotes(""); }}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClose}
                  disabled={!countedAmount}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg font-medium"
                >
                  Confirmar Cierre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}