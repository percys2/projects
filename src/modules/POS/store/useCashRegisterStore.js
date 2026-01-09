"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const getTodayManagua = () => {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
};

const getDefaultBranchState = () => ({
  isOpen: false,
  openingAmount: 0,
  openingTime: null,
  closingTime: null,
  user: null,
  movements: [],
  businessDate: null,
  dayChangedWhileOpen: false,
});

export const useCashRegisterStore = create(
  persist(
    (set, get) => ({
      branches: {},
      closingHistory: [],

      getBranchState: (branchId) => {
        const { branches } = get();
        return branches[branchId] || getDefaultBranchState();
      },

      checkAndResetForNewDay: (branchId) => {
        const { branches } = get();
        const branchState = branches[branchId] || getDefaultBranchState();
        const today = getTodayManagua();
        
        if (branchState.businessDate && branchState.businessDate !== today) {
          if (branchState.isOpen) {
            set((state) => ({
              branches: {
                ...state.branches,
                [branchId]: { ...branchState, dayChangedWhileOpen: true },
              },
            }));
            return { needsClosing: true, previousDate: branchState.businessDate };
          } else {
            set((state) => ({
              branches: {
                ...state.branches,
                [branchId]: {
                  ...getDefaultBranchState(),
                  businessDate: today,
                },
              },
            }));
            return { wasReset: true, previousDate: branchState.businessDate };
          }
        }
        
        if (!branchState.businessDate) {
          set((state) => ({
            branches: {
              ...state.branches,
              [branchId]: { ...branchState, businessDate: today },
            },
          }));
        }
        
        return { noChange: true };
      },

      clearDayChangedWarning: (branchId) => {
        set((state) => {
          const branchState = state.branches[branchId] || getDefaultBranchState();
          return {
            branches: {
              ...state.branches,
              [branchId]: { ...branchState, dayChangedWhileOpen: false },
            },
          };
        });
      },

      openCashRegister: ({ amount, user, branchId }) => {
        set((state) => ({
          branches: {
            ...state.branches,
            [branchId]: {
              isOpen: true,
              openingAmount: amount,
              user,
              openingTime: new Date().toISOString(),
              movements: [],
              closingTime: null,
              businessDate: getTodayManagua(),
              dayChangedWhileOpen: false,
            },
          },
        }));
      },

      addMovement: (branchId, movement) => {
        set((state) => {
          const branchState = state.branches[branchId] || getDefaultBranchState();
          return {
            branches: {
              ...state.branches,
              [branchId]: {
                ...branchState,
                movements: [...branchState.movements, { ...movement, timestamp: new Date().toISOString(), branchId }],
              },
            },
          };
        });
      },

      getTotals: (branchId) => {
        const { branches } = get();
        const branchState = branches[branchId] || getDefaultBranchState();
        const { openingAmount, movements } = branchState;
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

      getTotal: (branchId) => {
        const { branches } = get();
        const branchState = branches[branchId] || getDefaultBranchState();
        const { openingAmount, movements } = branchState;
        let income = 0;
        let expense = 0;
        for (const m of movements) {
          if (m.type === "entrada") income += m.amount;
          if (m.type === "salida") expense += m.amount;
        }
        return openingAmount + income - expense;
      },

      closeCashRegister: ({ branchId, countedAmount, notes } = {}) => {
        const { branches, getTotals } = get();
        const branchState = branches[branchId] || getDefaultBranchState();
        const totals = getTotals(branchId);
        const counted = countedAmount || totals.expectedTotal;
        const difference = counted - totals.expectedTotal;
        
        const closingRecord = {
          id: Date.now(),
          openingTime: branchState.openingTime,
          closingTime: new Date().toISOString(),
          branchId: branchId,
          user: branchState.user,
          openingAmount: branchState.openingAmount,
          totalEntradas: totals.totalEntradas,
          totalSalidas: totals.totalSalidas,
          expectedTotal: totals.expectedTotal,
          countedAmount: counted,
          difference,
          notes: notes || "",
          salesCount: totals.salesCount,
          movements: [...branchState.movements],
        };
        
        set((state) => ({
          branches: {
            ...state.branches,
            [branchId]: {
              ...getDefaultBranchState(),
              closingTime: new Date().toISOString(),
            },
          },
          closingHistory: [...state.closingHistory, closingRecord],
        }));
        
        return closingRecord;
      },

      getClosingHistory: () => get().closingHistory,

      resetCashRegister: (branchId) => {
        set((state) => ({
          branches: {
            ...state.branches,
            [branchId]: getDefaultBranchState(),
          },
        }));
      },
    }),
    {
      name: "cash-register-storage-v2",
      storage: createJSONStorage(() => 
        typeof window !== "undefined" ? localStorage : undefined
      ),
    }
  )
);
