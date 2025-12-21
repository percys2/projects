"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";

const DENOMINATIONS = [
  { value: 1000, label: "C$ 1,000" },
  { value: 500, label: "C$ 500" },
  { value: 200, label: "C$ 200" },
  { value: 100, label: "C$ 100" },
  { value: 50, label: "C$ 50" },
  { value: 20, label: "C$ 20" },
  { value: 10, label: "C$ 10" },
  { value: 5, label: "C$ 5" },
  { value: 1, label: "C$ 1" },
];

const BANKS = [
  { id: "bac", name: "BAC" },
  { id: "lafise", name: "Lafise" },
];

export default function CloseCashModal({ onClose, onConfirm }) {
  const getTotals = useCashRegisterStore((s) => s.getTotals);
  const openingTime = useCashRegisterStore((s) => s.openingTime);
  const movements = useCashRegisterStore((s) => s.movements);

  const [billCounts, setBillCounts] = useState(
    DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d.value]: "" }), {})
  );
  const [transfers, setTransfers] = useState(
    BANKS.reduce((acc, b) => ({ ...acc, [b.id]: "" }), {})
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totals = getTotals();

  const cashAmount = DENOMINATIONS.reduce((total, d) => {
    const count = parseInt(billCounts[d.value]) || 0;
    return total + (count * d.value);
  }, 0);

  const transfersAmount = BANKS.reduce((total, b) => {
    const amount = parseFloat(transfers[b.id]) || 0;
    return total + amount;
  }, 0);

  const countedAmount = cashAmount + transfersAmount;

  const difference = countedAmount - totals.expectedTotal;

  const handleBillCountChange = (denomination, value) => {
    const numValue = value === "" ? "" : Math.max(0, parseInt(value) || 0);
    setBillCounts(prev => ({
      ...prev,
      [denomination]: numValue === 0 ? "" : numValue.toString()
    }));
  };

  const handleTransferChange = (bankId, value) => {
    setTransfers(prev => ({
      ...prev,
      [bankId]: value
    }));
  };

  const handleConfirm = async () => {
    if (countedAmount === 0) {
      alert("Debe ingresar el conteo de billetes o transferencias");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm({
        countedAmount,
        cashAmount,
        transfersAmount,
        notes,
        billCounts,
        transfers,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "-";
    return new Date(isoString).toLocaleString("es-NI");
  };

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })}`;
  };

  const getSubtotal = (denomination) => {
    const count = parseInt(billCounts[denomination]) || 0;
    return count * denomination;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm">Conteo Fisico - Desglose de Billetes</h3>
            
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-500 mb-2 px-1">
                <div className="col-span-3">Denominacion</div>
                <div className="col-span-3 text-center">Cantidad</div>
                <div className="col-span-3"></div>
                <div className="col-span-3 text-right">Subtotal</div>
              </div>
              
              {DENOMINATIONS.map((d) => (
                <div key={d.value} className="grid grid-cols-12 gap-2 items-center py-1.5 border-b border-slate-200 last:border-0">
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-slate-700">{d.label}</span>
                  </div>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      value={billCounts[d.value]}
                      onChange={(e) => handleBillCountChange(d.value, e.target.value)}
                      placeholder="0"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-center text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="col-span-3 text-center text-slate-400 text-sm">
                    x {d.value.toLocaleString()}
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-sm font-medium text-slate-700">
                      {formatCurrency(getSubtotal(d.value))}
                    </span>
                  </div>
                </div>
              ))}
              
              <div className="grid grid-cols-12 gap-2 items-center pt-3 mt-2 border-t-2 border-slate-300">
                <div className="col-span-9">
                  <span className="font-bold text-slate-800">Subtotal Efectivo</span>
                </div>
                <div className="col-span-3 text-right">
                  <span className="font-bold text-lg text-slate-800">
                    {formatCurrency(cashAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-slate-700 text-sm">Transferencias Bancarias</h3>
            
            <div className="bg-purple-50 rounded-lg p-3">
              {BANKS.map((bank) => (
                <div key={bank.id} className="flex items-center justify-between py-2 border-b border-purple-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">{bank.name}</span>
                  </div>
                  <div className="relative w-40">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">C$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={transfers[bank.id]}
                      onChange={(e) => handleTransferChange(bank.id, e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-1.5 border border-purple-300 rounded text-right text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-purple-300">
                <span className="font-bold text-purple-800">Subtotal Transferencias</span>
                <span className="font-bold text-lg text-purple-800">
                  {formatCurrency(transfersAmount)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-800 text-lg">TOTAL GENERAL</span>
              <span className="font-bold text-2xl text-emerald-800">
                {formatCurrency(countedAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-emerald-600 mt-1">
              <span>Efectivo: {formatCurrency(cashAmount)}</span>
              <span>Transferencias: {formatCurrency(transfersAmount)}</span>
            </div>
          </div>

          {countedAmount > 0 && (
            <div className={`p-4 rounded-lg ${
              difference === 0 
                ? "bg-green-50 border border-green-200" 
                : difference > 0 
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-red-50 border border-red-200"
            }`}>
              <div className="flex justify-between items-center">
                <span className={`font-semibold ${
                  difference === 0 
                    ? "text-green-700" 
                    : difference > 0 
                      ? "text-blue-700"
                      : "text-red-700"
                }`}>
                  {difference === 0 
                    ? "Sin diferencia" 
                    : difference > 0 
                      ? "SOBRANTE"
                      : "FALTANTE"}
                </span>
                <span className={`text-xl font-bold ${
                  difference === 0 
                    ? "text-green-700" 
                    : difference > 0 
                      ? "text-blue-700"
                      : "text-red-700"
                }`}>
                  {difference === 0 ? "-" : formatCurrency(Math.abs(difference))}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="font-semibold text-slate-700 text-sm">
              Notas {difference !== 0 && "(explique la diferencia)"}
            </label>
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
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-800 rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={countedAmount === 0 || isSubmitting}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                "Confirmar Cierre"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}