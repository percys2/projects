"use client";

import { create } from "zustand";
import { salesService } from "../services/salesService";

export const usePosStore = create((set, get) => ({
  carts: {},
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

  getCart: (branchId) => {
    const state = get();
    return state.carts[branchId] || [];
  },

  setCustomerField: (field, value) =>
    set((state) => ({
      customerForm: { ...state.customerForm, [field]: value },
    })),

  setClient: (client) => set({ selectedClient: client }),
  clearClient: () => set({ selectedClient: null }),

  addToCart: (branchId, product) =>
    set((state) => {
      const currentCart = state.carts[branchId] || [];
      const exists = currentCart.find((c) => c.id === product.id);

      let newCart;
      if (exists) {
        newCart = currentCart.map((c) =>
          c.id === product.id ? { ...c, qty: (c.qty || 1) + 1 } : c
        );
      } else {
        newCart = [...currentCart, { ...product, qty: 1 }];
      }

      return {
        carts: {
          ...state.carts,
          [branchId]: newCart,
        },
      };
    }),

  removeFromCart: (branchId, productId) =>
    set((state) => {
      const currentCart = state.carts[branchId] || [];
      return {
        carts: {
          ...state.carts,
          [branchId]: currentCart.filter((c) => c.id !== productId),
        },
      };
    }),

  updateQuantity: (branchId, productId, qty) =>
    set((state) => {
      const currentCart = state.carts[branchId] || [];
      return {
        carts: {
          ...state.carts,
          [branchId]: currentCart.map((c) =>
            c.id === productId ? { ...c, qty } : c
          ),
        },
      };
    }),

  clearCart: (branchId) =>
    set((state) => ({
      carts: {
        ...state.carts,
        [branchId]: [],
      },
    })),

  resetCustomerForm: () =>
    set({
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
    }),

  checkout: async ({ paymentMethod, discount, received, change, branchId }) => {
    const state = get();
    const cart = state.carts[branchId] || [];

    if (!state.selectedClient)
      throw new Error("Seleccione un cliente antes de finalizar.");

    if (cart.length === 0)
      throw new Error("El carrito está vacío.");

    const orgSlug = localStorage.getItem("activeOrgSlug");
    const orgId = localStorage.getItem("activeOrgId");

    if (!orgSlug || !orgId || !branchId)
      throw new Error("Faltan datos de organización o sucursal.");

    const saleData = {
      orgSlug,
      orgId,
      client: state.selectedClient,
      cart: cart,
      paymentType: paymentMethod,
      discount,
      received,
      change,
      branch: state.selectedClient?.branch,
      branchId,
    };

    const sale = await salesService.makeSale(saleData);

    set((s) => ({
      carts: {
        ...s.carts,
        [branchId]: [],
      },
    }));

    return sale.id;
  },
}));