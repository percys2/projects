
"use client";

import { useBranchStore } from "../store/useBranchStore";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { usePosStore } from "../store/usePosStore";

export default function PosHeader() {
  const branches = useBranchStore((s) => s.branches);
  const activeBranch = useBranchStore((s) => s.activeBranch);
  const setBranch = useBranchStore((s) => s.setBranch);
  
  const isCashOpen = useCashRegisterStore((s) => s.isCashOpen);
  const closeCash = useCashRegisterStore((s) => s.closeCashRegister);
  const getTotal = useCashRegisterStore((s) => s.getTotal);
  
  const getCart = usePosStore((s) => s.getCart);

  const currentCart = getCart(activeBranch);
  const cashOpen = isCashOpen(activeBranch);

  const handleCloseCash = () => {
    const total = getTotal(activeBranch);
    alert(`Cierre de caja realizado. Total en caja: C$ ${total.toFixed(2)}`);
    closeCash(activeBranch);
  };

  return (
    <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg shadow-sm">
      <div>
        <h1 className="text-lg font-semibold">Punto de Venta</h1>
        {activeBranch && (
          <p className="text-xs text-slate-500">Carrito: {currentCart.length} productos</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {cashOpen && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Caja Abierta
          </span>
        )}

        <select
          className="text-sm border rounded px-2 py-1"
          value={activeBranch}
          onChange={(e) => setBranch(e.target.value)}
        >
          {branches.length === 0 ? (
            <option value="">Cargando sucursales...</option>
          ) : (
            branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))
          )}
        </select>

        {cashOpen && (
          <button
            onClick={handleCloseCash}
            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700"
          >
            Cerrar Caja
          </button>
        )}
      </div>
    </div>
  );
}