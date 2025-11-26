"use client";

import { useCashRegisterStore } from "../store/useCashRegisterStore";

export default function CloseCashButton() {
  const close = useCashRegisterStore((s) => s.closeCashRegister);
  const getTotal = useCashRegisterStore((s) => s.getTotal);

  const handleClose = () => {
    const total = getTotal();
    alert(`Cierre de caja realizado. Total en caja: C$ ${total}`);
    close();
  };

  return (
    <button
      onClick={handleClose}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Cerrar Caja
    </button>
  );
}
