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
      
      // Historial de cierres para auditoria
      closingHistory: [],

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
          movements: [...state.movements, { ...movement, timestamp: new Date().toISOString() }],
        })),

      // Calcular totales desglosados
      getTotals: () => {
        const { openingAmount, movements } = get();
        let totalEntradas = 0;
        let totalSalidas = 0;
        let salesCount = 0;
        
        for (const m of movements) {
          if (m.type === "entrada") {
            totalEntradas += m.amount;
            salesCount++;
          }
          if (m.type === "salida") {
            totalSalidas += m.amount;
          }
        }
        
        const expectedTotal = openingAmount + totalEntradas - totalSalidas;
        
        return {
          openingAmount,
          totalEntradas,
          totalSalidas,
          expectedTotal,
          salesCount,
          movementsCount: movements.length,
        };
      },

      // Mantener getTotal para compatibilidad
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

      // Cerrar caja con cotejo
      closeCashRegister: ({ countedAmount, notes }) => {
        const state = get();
        const totals = state.getTotals();
        const difference = countedAmount - totals.expectedTotal;
        
        const closingRecord = {
          id: Date.now(),
          openingTime: state.openingTime,
          closingTime: new Date().toISOString(),
          branch: state.branch,
          user: state.user,
          openingAmount: state.openingAmount,
          totalEntradas: totals.totalEntradas,
          totalSalidas: totals.totalSalidas,
          expectedTotal: totals.expectedTotal,
          countedAmount,
          difference,
          notes: notes || "",
          salesCount: totals.salesCount,
          movements: [...state.movements],
        };
        
        set((state) => ({
          isOpen: false,
          closingTime: new Date().toISOString(),
          closingHistory: [...state.closingHistory, closingRecord],
        }));
        
        return closingRecord;
      },

      // Obtener historial de cierres
      getClosingHistory: () => get().closingHistory,

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