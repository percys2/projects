"use client";
import { create } from "zustand";

export const usePosStore = create((set) => ({
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
}));
