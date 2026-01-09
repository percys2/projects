"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

export default function OpenCashModal({ orgSlug }) {
  const { activeBranch } = useBranchStore();
  const openCashStore = useCashRegisterStore((s) => s.openCashRegister);
  const getBranchState = useCashRegisterStore((s) => s.getBranchState);
  
  const branchState = getBranchState(activeBranch);
  const isOpen = branchState.isOpen;

  const [amount, setAmount] = useState("");

  if (isOpen) return null;

  const handleOpen = () => {
    if (!amount) return alert("Ingrese un monto inicial");

    openCashStore({
      amount: Number(amount),
      user: "Cajero Principal",
      branchId: activeBranch,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Apertura de Caja</h2>

        <label className="text-sm font-medium">Monto inicial</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded p-2 mt-2"
          type="number"
          placeholder="0"
        />

        <button
          onClick={handleOpen}
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-4"
        >
          Abrir Caja
        </button>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 mb-2 text-center">O puede acceder a otros modulos:</p>
          <div className="flex gap-2 justify-center">
            <a href={`/${orgSlug}/inventory`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Inventario</a>
            <a href={`/${orgSlug}/sales`} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">Ventas</a>
          </div>
        </div>
      </div>
    </div>
  );
}
