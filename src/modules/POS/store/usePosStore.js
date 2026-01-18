"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { salesService } from "../services/salesService";

export const usePosStore = create(
  persist(
    (set, get) => ({
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

      setCustomerField: (field, value) =>
        set((state) => ({
          customerForm: { ...state.customerForm, [field]: value },
        })),

      setClient: (client) => set({ selectedClient: client }),
      clearClient: () => set({ selectedClient: null }),

      addToCart: (branch, product) =>
        set((state) => {
          const branchCart = state.carts[branch] || [];
          const exists = branchCart.find((c) => (c.id || c.product_id) === (product.id || product.product_id));

          if (exists) {
            return {
              carts: {
                ...state.carts,
                [branch]: branchCart.map((c) =>
                  (c.id || c.product_id) === (product.id || product.product_id) 
                    ? { ...c, qty: c.qty + 1 } 
                    : c
                ),
              },
            };
          }

          return {
            carts: {
              ...state.carts,
              [branch]: [...branchCart, { ...product, qty: 1 }],
            },
          };
        }),

      removeFromCart: (branch, id) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [branch]: (state.carts[branch] || []).filter((c) => (c.id || c.product_id) !== id),
          },
        })),

      decreaseQty: (branch, id) =>
        set((state) => {
          const branchCart = state.carts[branch] || [];
          const item = branchCart.find((c) => (c.id || c.product_id) === id);
          
          if (!item) return state;
          
          if (item.qty <= 1) {
            return {
              carts: {
                ...state.carts,
                [branch]: branchCart.filter((c) => (c.id || c.product_id) !== id),
              },
            };
          }
          
          return {
            carts: {
              ...state.carts,
              [branch]: branchCart.map((c) =>
                (c.id || c.product_id) === id ? { ...c, qty: c.qty - 1 } : c
              ),
            },
          };
        }),

      increaseQty: (branch, id) =>
        set((state) => {
          const branchCart = state.carts[branch] || [];
          return {
            carts: {
              ...state.carts,
              [branch]: branchCart.map((c) =>
                (c.id || c.product_id) === id ? { ...c, qty: c.qty + 1 } : c
              ),
            },
          };
        }),

      updateCartQty: (branch, id, qty) =>
        set((state) => {
          const branchCart = state.carts[branch] || [];
          if (qty <= 0) {
            return {
              carts: {
                ...state.carts,
                [branch]: branchCart.filter((c) => (c.id || c.product_id) !== id),
              },
            };
          }
          return {
            carts: {
              ...state.carts,
              [branch]: branchCart.map((c) =>
                (c.id || c.product_id) === id ? { ...c, qty } : c
              ),
            },
          };
        }),

      clearCart: (branch) =>
        set((state) => ({
          carts: {
            ...state.carts,
            [branch]: [],
          },
        })),

      checkout: async ({ branch, paymentMethod, discount, received, change }) => {
        const state = get();
        const cart = state.carts[branch] || [];

        if (cart.length === 0)
          throw new Error("El carrito esta vacio.");

        const orgSlug = localStorage.getItem("activeOrgSlug");
        const orgId = localStorage.getItem("activeOrgId");
        const branchId = branch || localStorage.getItem("activeBranchId");

        if (!orgSlug || !orgId || !branchId)
          throw new Error("Faltan datos de organizacion o sucursal.");

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

        set((state) => ({
          carts: {
            ...state.carts,
            [branch]: [],
          },
        }));

        return sale.id;
      },
    }),
    {
      name: "pos-cart-storage",
      partialize: (state) => ({
        carts: state.carts,
        selectedClient: state.selectedClient,
      }),
    }
  )
);