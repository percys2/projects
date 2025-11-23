import { create } from "zustand";

export const usePipelineStore = create((set) => ({
  stats: {
    lead: 0,
    prospecto: 0,
    activo: 0,
    frecuente: 0,
    alto: 0,
    inactivo: 0,
  },

  updateStats: (pipeline) => {
    set((state) => ({
      stats: {
        ...state.stats,
        [pipeline]: state.stats[pipeline] + 1,
      },
    }));
  },
}));
