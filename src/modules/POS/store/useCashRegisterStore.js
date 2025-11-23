"use client";

import { create } from "zustand";

export const useCashRegisterStore = create((set, get) => ({

  // 🟢 ESTADO DE CAJA
  isOpen: false,          // ¿La caja está abierta?
  openingAmount: 0,       // Fondo inicial
  openingTime: null,      // Hora
  closingTime: null,
  branch: null,           // Sucursal
  user: null,             // Cajero
  movements: [],          // Entradas/salidas

  // 🟢 ABRIR CAJA
  openCashRegister: ({ amount, user, branch }) =>
    set({
      isOpen: true,
      openingAmount: amount,
      branch,
      user,
      openingTime: new Date(),
      movements: [],   // vaciar movimientos del día
      closingTime: null,
    }),

  // 🟣 REGISTRAR MOVIMIENTO
  addMovement: (movement) =>
    set((state) => ({
      movements: [...state.movements, movement]
    })),

  // 🟤 CALCULAR TOTAL EN CAJA
  getTotal: () => {
    const { openingAmount, movements } = get();

    let income = 0;
    let expense = 0;

    for (const m of movements) {
      if (m.type === "entrada") income += m.amount;
      if (m.type === "salida") expense += m.amount;
    }

    return openingAmount + income - expense;
  },

  // 🔴 CERRAR CAJA
  closeCashRegister: () =>
    set({
      isOpen: false,
      closingTime: new Date(),
    }),

}));
