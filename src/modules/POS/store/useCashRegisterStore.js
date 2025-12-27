"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const getTodayManagua = () => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
};

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
      businessDate: null,
      dayChangedWhileOpen: false,
      closingHistory: [],

      checkAndResetForNewDay: () => {
        const state = get();
        const today = getTodayManagua();
        
        if (state.businessDate && state.businessDate !== today) {
          if (state.isOpen) {
            set({ dayChangedWhileOpen: true });
            return { needsClosing: true, previousDate: state.businessDate };
          } else {
            set({
              openingAmount: 0,
              openingTime: null,
              closingTime: null,
              movements: [],
              businessDate: today,
              dayChangedWhileOpen: false,
            });
            return { wasReset: true, previousDate: state.businessDate };
          }
        }
        
        if (!state.businessDate) {
          set({ businessDate: today });
        }
        
        return { noChange: true };
      },

      clearDayChangedWarning: () => set({ dayChangedWhileOpen: false }),

      openCashRegister: ({ amount, user, branch }) =>
        set({
          isOpen: true,
          openingAmount: amount,
          branch,
          user,
          openingTime: new Date().toISOString(),
          movements: [],
          closingTime: null,
          businessDate: getTodayManagua(),
          dayChangedWhileOpen: false,
        }),

      addMovement: (movement) =>
        set((state) => ({
          movements: [...state.movements, { ...movement, timestamp: new Date().toISOString() }],
        })),

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
        
        return {
          openingAmount,
          totalEntradas,
          totalSalidas,
          expectedTotal: openingAmount + totalEntradas - totalSalidas,
          salesCount,
          movementsCount: movements.length,
        };
      },

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

      closeCashRegister: ({ countedAmount, notes } = {}) => {
        const state = get();
        const totals = state.getTotals();
        const counted = countedAmount || totals.expectedTotal;
        const difference = counted - totals.expectedTotal;
        
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
          countedAmount: counted,
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