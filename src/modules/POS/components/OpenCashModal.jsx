"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

export default function OpenCashModal() {
  const activeBranch = useBranchStore((s) => s.activeBranch);
  const branches = useBranchStore((s) => s.branches);
  const openCash = useCashRegisterStore((s) => s.openCashRegister);
  const isCashOpen = useCashRegisterStore((s) => s.isCashOpen);

  const [amount, setAmount] = useState("");

  const isOpen = isCashOpen(activeBranch);
  const branchName = branches.find((b) => b.id === activeBranch)?.name || activeBranch;

  if (isOpen || !activeBranch) return null;

  const handleOpen = () => {
    if (!amount) return alert("Ingrese un monto inicial");

    openCash(activeBranch, {
      amount: Number(amount),
      user: "Cajero Principal",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Apertura de Caja</h2>
        <p className="text-sm text-slate-500 mb-4">Sucursal: {branchName}</p>

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
          className="w-full bg-green-600 text-white py-2 rounded-lg mt-4 hover:bg-green-700"
        >
          Abrir Caja
        </button>
      </div>
    </div>
  );
}
