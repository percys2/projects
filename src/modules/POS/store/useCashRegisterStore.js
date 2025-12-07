"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCashRegisterStore = create(
  persist(
    (set, get) => ({
      isOpen: false,
      openingAmount: 0,
      openingTime: null,
      closingTime: null,
      branch: null,
      user: null,
      movements: [],

      openCashRegister: ({ amount, user, branch }) =>
        set({
          isOpen: true,
          openingAmount: amount,
          branch,
          user,
          openingTime: new Date().toISOString(),
          movements: [],
          closingTime: null,
        }),

      addMovement: (movement) =>
        set((state) => ({
          movements: [...state.movements, movement],
        })),

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

      closeCashRegister: () =>
        set({
          isOpen: false,
          closingTime: new Date().toISOString(),
        }),

      resetCashRegister: () =>
        set({
          isOpen: false,
          openingAmount: 0,
          openingTime: null,
          closingTime: null,
          branch: null,
          user: null,
          movements: [],
        }),
    }),
    {
      name: "cash-register-storage",
      storage: createJSONStorage(() => 
        typeof window !== "undefined" ? localStorage : undefined
      ),
    }
  )
);