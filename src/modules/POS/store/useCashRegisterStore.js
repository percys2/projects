"use client";

import { create } from "zustand";

export const useCashRegisterStore = create((set, get) => ({
  branches: {},

  isCashOpen: (branchId) => {
    const state = get();
    return state.branches[branchId]?.isOpen || false;
  },

  getCashData: (branchId) => {
    const state = get();
    return state.branches[branchId] || {
      isOpen: false,
      openingAmount: 0,
      openingTime: null,
      closingTime: null,
      user: null,
      movements: [],
      dayChangedWhileOpen: false,
    };
  },

  openCashRegister: (branchId, { amount, user }) =>
    set((state) => ({
      branches: {
        ...state.branches,
        [branchId]: {
          isOpen: true,
          openingAmount: amount,
          user,
          openingTime: new Date(),
          movements: [],
          closingTime: null,
          dayChangedWhileOpen: false,
        },
      },
    })),

  addMovement: (branchId, movement) =>
    set((state) => {
      const currentBranch = state.branches[branchId] || {};
      return {
        branches: {
          ...state.branches,
          [branchId]: {
            ...currentBranch,
            movements: [...(currentBranch.movements || []), movement],
          },
        },
      };
    }),

  getTotal: (branchId) => {
    const state = get();
    const branchData = state.branches[branchId];
    if (!branchData) return 0;

    const { openingAmount = 0, movements = [] } = branchData;

    let income = 0;
    let expense = 0;

    for (const m of movements) {
      if (m.type === "entrada") income += m.amount;
      if (m.type === "salida") expense += m.amount;
    }

    return openingAmount + income - expense;
  },

  checkAndResetForNewDay: (branchId) => {
    const state = get();
    const branchData = state.branches[branchId];
    if (!branchData || !branchData.isOpen) return;

    const openingDate = new Date(branchData.openingTime);
    const today = new Date();
    
    if (openingDate.toDateString() !== today.toDateString()) {
      set((s) => ({
        branches: {
          ...s.branches,
          [branchId]: {
            ...s.branches[branchId],
            dayChangedWhileOpen: true,
          },
        },
      }));
    }
  },

  closeCashRegister: (branchId) =>
    set((state) => {
      const currentBranch = state.branches[branchId] || {};
      return {
        branches: {
          ...state.branches,
          [branchId]: {
            ...currentBranch,
            isOpen: false,
            closingTime: new Date(),
          },
        },
      };
    }),
}));