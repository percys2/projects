"use client";

import { create } from "zustand";
import { salesService } from "../services/salesService";

export const usePosStore = create((set, get) => ({
  cart: [],
  selectedClient: null,
  stockWarnings: [],

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
      const availableStock = product.quantity ?? product.stock ?? product.current_stock ?? 0;

      // Si no hay stock, mostrar alerta y no agregar
      if (availableStock <= 0 && !exists) {
        return {
          ...state,
          stockWarnings: [...state.stockWarnings, {
            id: Date.now(),
            product: product.name || "Producto",
            message: "Sin stock disponible",
            type: "error"
          }]
        };
      }

      if (exists) {
        // Verificar si excede el stock disponible
        if (exists.qty >= availableStock) {
          return {
            ...state,
            stockWarnings: [...state.stockWarnings, {
              id: Date.now(),
              product: product.name || "Producto",
              message: `Stock maximo alcanzado (${availableStock} unidades)`,
              type: "warning"
            }]
          };
        }
        
        // Alerta de stock bajo (menos de 5 unidades restantes)
        const newQty = exists.qty + 1;
        const remaining = availableStock - newQty;
        let warnings = state.stockWarnings;
        
        if (remaining <= 5 && remaining > 0) {
          warnings = [...warnings, {
            id: Date.now(),
            product: product.name || "Producto",
            message: `Stock bajo: quedan ${remaining} unidades`,
            type: "warning"
          }];
        }
        
        return {
          cart: state.cart.map((c) =>
            (c.id || c.product_id) === productId ? { ...c, qty: newQty } : c
          ),
          stockWarnings: warnings
        };
      }

      // Alerta si el stock es bajo al agregar
      let warnings = state.stockWarnings;
      if (availableStock <= 5) {
        warnings = [...warnings, {
          id: Date.now(),
          product: product.name || "Producto",
          message: `Stock bajo: solo ${availableStock} unidades disponibles`,
          type: "warning"
        }];
      }

      return { 
        cart: [...state.cart, { ...product, id: productId, qty: 1, availableStock }],
        stockWarnings: warnings
      };
    }),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((c) => c.id !== id),
    })),

  updateCartQty: (id, qty) =>
    set((state) => {
      const item = state.cart.find((c) => c.id === id);
      if (item) {
        const availableStock = item.availableStock || item.quantity || 0;
        if (qty > availableStock) {
          return {
            ...state,
            stockWarnings: [...state.stockWarnings, {
              id: Date.now(),
              product: item.name || "Producto",
              message: `No puede exceder ${availableStock} unidades`,
              type: "error"
            }]
          };
        }
      }
      return {
        cart: state.cart.map((c) => 
          c.id === id ? { ...c, qty: Math.max(1, Math.min(qty, c.availableStock || qty)) } : c
        ),
      };
    }),

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
    set((state) => {
      const item = state.cart.find((c) => c.id === id);
      if (item) {
        const availableStock = item.availableStock || item.quantity || 0;
        if (item.qty >= availableStock) {
          return {
            ...state,
            stockWarnings: [...state.stockWarnings, {
              id: Date.now(),
              product: item.name || "Producto",
              message: `Stock maximo alcanzado (${availableStock})`,
              type: "warning"
            }]
          };
        }
        
        const newQty = item.qty + 1;
        const remaining = availableStock - newQty;
        let warnings = state.stockWarnings;
        
        if (remaining <= 5 && remaining > 0) {
          warnings = [...warnings, {
            id: Date.now(),
            product: item.name || "Producto",
            message: `Quedan solo ${remaining} unidades`,
            type: "warning"
          }];
        }
        
        return {
          cart: state.cart.map((c) =>
            c.id === id ? { ...c, qty: newQty } : c
          ),
          stockWarnings: warnings
        };
      }
      return state;
    }),

  clearCart: () => set({ cart: [], stockWarnings: [] }),
  
  clearWarnings: () => set({ stockWarnings: [] }),
  
  dismissWarning: (warningId) => 
    set((state) => ({
      stockWarnings: state.stockWarnings.filter(w => w.id !== warningId)
    })),

  checkout: async ({ paymentMethod, discount, received, change }) => {
    const state = get();

    if (!state.selectedClient)
      throw new Error("Seleccione un cliente antes de finalizar.");

    if (state.cart.length === 0)
      throw new Error("El carrito esta vacio.");

    const orgSlug = localStorage.getItem("activeOrgSlug");
    const orgId = localStorage.getItem("activeOrgId");
    const branchId = localStorage.getItem("activeBranchId");

    if (!orgSlug || !orgId || !branchId)
      throw new Error("Faltan datos de organizacion o sucursal.");

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
    set({ cart: [], stockWarnings: [] });
    return sale.id;
  },
}));