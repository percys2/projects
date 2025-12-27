"use client";

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
      const productId = product.id || product.product_id;
      const exists = state.cart.find((c) => (c.id || c.product_id) === productId);

      if (exists) {
        return {
          cart: state.cart.map((c) =>
            (c.id || c.product_id) === productId ? { ...c, qty: c.qty + 1 } : c
          ),
        };
      }

      return { cart: [...state.cart, { ...product, id: productId, qty: 1 }] };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.id !== id),
    })),

  decreaseQty: (id) =>
    set((state) => {
      const item = state.cart.find((c) => c.id === id);
      if (item && item.qty <= 1) {
        return { cart: state.cart.filter((c) => c.id !== id) };
      }
      return {
        cart: state.cart.map((c) =>
          c.id === id ? { ...c, qty: c.qty - 1 } : c
        ),
      };
    }),

  increaseQty: (id) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.id === id ? { ...c, qty: c.qty + 1 } : c
      ),
    })),

  updateCartQty: (id, qty) =>
    set((state) => ({
      cart: state.cart.map((c) =>
        c.id === id ? { ...c, qty: Math.max(1, qty) } : c
      ),
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
