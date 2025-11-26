"use client";

import { create } from "zustand";

export const useBranchStore = create((set) => ({
  branches: [
    { id: "masatepe", name: "Bodega Masatepe" },
    { id: "diriomo", name: "Bodega Diriomo" },
  ],

  activeBranch: "masatepe",

  setBranch: (branch) => set({ activeBranch: branch }),
}));
