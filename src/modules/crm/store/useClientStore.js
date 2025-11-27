// src/modules/clients/store/useClientStore.js

import { create } from "zustand";
import { clientsService } from "../services/clientService";

export const useClientStore = create((set, get) => ({
  clients: [],
  loading: false,

  loadClients: async () => {
    set({ loading: true });
    try {
      const data = await clientsService.getAll();
      set({ clients: data, loading: false });
    } catch (error) {
      console.error("Error loading clients:", error);
      set({ loading: false });
    }
  },

  addClient: async (client) => {
    const saved = await clientsService.create(client);
    set({ clients: [...get().clients, saved] });
  },

  updateClient: async (client) => {
    const updated = await clientsService.update(client);
    set({
      clients: get().clients.map((c) =>
        c.id === updated.id ? updated : c
      ),
    });
  },

  removeClient: async (id) => {
    await clientsService.remove(id);
    set({ clients: get().clients.filter((c) => c.id !== id) });
  },
}));
