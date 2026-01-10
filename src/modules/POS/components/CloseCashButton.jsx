"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

const DENOMINATIONS = [1000, 500, 200, 100, 50, 20, 10, 5, 1];

export default function CloseCashButton({ orgSlug, daySalesTotal = 0 }) {
  const branch = useBranchStore((s) => s.activeBranch);
  
  // Use direct subscription to branch data for proper re-renders
  const defaultBranchState = { isOpen: false, openingAmount: 0, movements: [], openingTime: null };
  const branchState = useCashRegisterStore((s) => s.branches[branch] || defaultBranchState);
  const closeCashRegisterStore = useCashRegisterStore((s) => s.closeCashRegister);
  
  const isOpen = branchState.isOpen;
  const openingTime = branchState.openingTime;
  const openingAmount = branchState.openingAmount;
  const movements = branchState.movements || [];
  
  const closeCashRegister = (params) => closeCashRegisterStore({ ...params, branchId: branch });

  const [showModal, setShowModal] = useState(false);
  const [denomCounts, setDenomCounts] = useState({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalSalidas = movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0);
  const totalVentas = daySalesTotal;
  const totalMenudeo = movements.filter(m => m.subtype === 'menudeo' && m.branchId === branch).reduce((acc, m) => acc + m.amount, 0);
  const expectedTotal = openingAmount + totalVentas + totalMenudeo - totalSalidas;
  
  const totals = {
    openingAmount,
    totalEntradas: totalVentas + totalMenudeo,
    totalSalidas,
    expectedTotal,
    salesCount: movements.filter(m => m.type === 'entrada' && m.subtype !== 'menudeo').length,
    movementsCount: movements.length,
  };

  const counted = DENOMINATIONS.reduce((sum, denom) => sum + (parseInt(denomCounts[denom]) || 0) * denom, 0);
  const difference = counted - expectedTotal;

  const handleDenomChange = (denom, value) => {
    setDenomCounts(prev => ({ ...prev, [denom]: value }));
  };

  const clearDenominations = () => {
    setDenomCounts({});
  };

  const handleClose = async () => {
    if (counted === 0) {
      alert("Debe ingresar el conteo de denominaciones");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const closingData = {
        branch_id: branch || null,
        opening_time: openingTime,
        closing_time: new Date().toISOString(),
        opening_amount: openingAmount,
        total_entries: totals.totalEntradas,
        total_exits: totals.totalSalidas,
        expected_total: totals.expectedTotal,
        counted_amount: counted,
        difference: difference,
        sales_count: totals.salesCount,
        movements_count: totals.movementsCount,
        notes: notes || "",
        movements: movements,
      };

      const res = await fetch("/api/pos/cash-closings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(closingData),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar el cierre");
      }

      closeCashRegister({ countedAmount: counted, notes });

      const diffText = difference === 0 
        ? "Sin diferencia" 
        : difference > 0 
          ? `Sobrante: C$ ${difference.toFixed(2)}`
          : `Faltante: C$ ${Math.abs(difference).toFixed(2)}`;

      alert(`Caja cerrada exitosamente.\n\nEsperado: C$ ${totals.expectedTotal.toFixed(2)}\nContado: C$ ${counted.toFixed(2)}\n${diffText}`);
      
      setShowModal(false);
      setDenomCounts({});
      setNotes("");
    } catch (error) {
      console.error("Error closing cash register:", error);
      alert(`Error al cerrar la caja: ${error.message}`);
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

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs"
      >
        Cerrar Caja
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
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
                  <span className="text-sm font-medium">{formatCurrency(openingAmount)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-green-600">+ Ventas (BD)</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totalVentas)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-purple-600">+ Menudeo</span>
                  <span className="text-sm font-medium text-purple-600">{formatCurrency(totalMenudeo)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-red-600">- Salidas (retiros)</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(totalSalidas)}</span>
                </div>
                <div className="flex justify-between py-3 bg-blue-50 rounded-lg px-3">
                  <span className="font-bold text-blue-800">Total Esperado</span>
                  <span className="font-bold text-blue-800 text-lg">{formatCurrency(expectedTotal)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700 text-sm">Conteo por Denominacion</h3>
                  <button onClick={clearDenominations} className="text-xs text-blue-600 hover:text-blue-800">Limpiar</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DENOMINATIONS.map((denom) => (
                    <div key={denom} className="bg-slate-50 rounded-lg p-2">
                      <label className="text-xs text-slate-500 block mb-1">C$ {denom}</label>
                      <input
                        type="number"
                        min="0"
                        value={denomCounts[denom] || ""}
                        onChange={(e) => handleDenomChange(denom, e.target.value)}
                        placeholder="0"
                        className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm text-center focus:border-blue-500 focus:outline-none"
                      />
                      {(parseInt(denomCounts[denom]) || 0) > 0 && (
                        <p className="text-xs text-green-600 text-center mt-1">
                          = C$ {((parseInt(denomCounts[denom]) || 0) * denom).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-green-800">Total Contado:</span>
                    <span className="text-xl font-bold text-green-800">C$ {counted.toLocaleString("es-NI", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {counted > 0 && (
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
                  onClick={() => { setShowModal(false); setDenomCounts({}); setNotes(""); }}
                  className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClose}
                  disabled={counted === 0 || isSubmitting}
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
      )}
    </>
  );
}
