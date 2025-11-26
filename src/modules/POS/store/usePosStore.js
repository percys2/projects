"use client";   // ← ESTO ES OBLIGATORIO PARA QUE NEXTJS LO ANALICE

import { create } from "zustand";
import { salesService } from "../services/salesService";

export const usePosStore = create((set, get) => ({
  cart: [],
  selectedClient: null,

  customerForm: {
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    country: "",
    phone: "",
    ruc: "",
  },

  setCustomerField: (field, value) =>
    set((state) => ({
      customerForm: { ...state.customerForm, [field]: value },
    })),

  setClient: (client) => set({ selectedClient: client }),
  clearClient: () => set({ selectedClient: null }),

  addToCart: (product) =>
    set((state) => {
      const exists = state.cart.find((c) => c.id === product.id);

      if (exists) {
        return {
          cart: state.cart.map((c) =>
            c.id === product.id ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }

      return { cart: [...state.cart, { ...product, qty: 1 }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.id !== id),
    })),

  clearCart: () => set({ cart: [] }),

  checkout: async ({ paymentMethod, discount, received, change }) => {
    const state = get();

    if (!state.selectedClient)
      throw new Error("Seleccione un cliente antes de finalizar.");

    if (state.cart.length === 0)
      throw new Error("El carrito está vacío.");

    const orgSlug = localStorage.getItem("activeOrgSlug");
    const orgId = localStorage.getItem("activeOrgId");
    const branchId = localStorage.getItem("activeBranchId");

    if (!orgSlug || !orgId || !branchId)
      throw new Error("Faltan datos de organización o sucursal.");

    const saleData = {
      orgSlug,
      orgId,
      client: state.selectedClient,
      cart: state.cart,
      paymentType: paymentMethod,
      discount,
      received,
      change,
      branch: state.selectedClient?.branch,
      branchId,
    };

    const sale = await salesService.makeSale(saleData);

    set({ cart: [] });

    return sale.id;
  },
}));
