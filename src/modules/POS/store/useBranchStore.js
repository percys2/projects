"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useBranchStore = create(
  persist(
    (set) => ({
      branches: [],
      activeBranch: null,

      setBranches: (branches) => set({ branches }),
      setBranch: (branchId) => set({ activeBranch: branchId }),
    }),
    {
      name: "pos-branch-storage",
    }
  )
);