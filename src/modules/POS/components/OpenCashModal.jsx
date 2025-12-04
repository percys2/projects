"use client";

import { useState } from "react";
import { useCashRegisterStore } from "../store/useCashRegisterStore";
import { useBranchStore } from "../store/useBranchStore";

export default function OpenCashModal() {
  const { activeBranch } = useBranchStore();
  const openCash = useCashRegisterStore((s) => s.openCashRegister);
  const isOpen = useCashRegisterStore((s) => s.isOpen);

  const [amount, setAmount] = useState("");

  if (isOpen) return null; // si ya está abierta, no mostrar modal

  const handleOpen = () => {
    if (!amount) return alert("Ingrese un monto inicial");

    openCash({
      amount: Number(amount),
      user: "Cajero Principal",  // luego lo conectamos a login
      branch: activeBranch,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
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
      </div>
    </div>
  );
}
