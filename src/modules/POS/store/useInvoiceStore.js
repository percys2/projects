"use client";

import { create } from "zustand";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber";

export const useInvoiceStore = create((set) => ({
  invoiceNumber: generateInvoiceNumber(),
  refreshInvoice: () =>
    set({ invoiceNumber: generateInvoiceNumber() }),
}));
