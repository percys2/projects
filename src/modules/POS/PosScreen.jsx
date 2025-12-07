"use client";

import React, { useEffect, useState } from "react";
import { inventoryService } from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";
import { useCashRegisterStore } from "./store/useCashRegisterStore";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import PosHeader from "./components/PosHeader";

export default function PosScreen({ orgSlug }) {
  const branches = useBranchStore((s) => s.branches);
  const branch = useBranchStore((s) => s.activeBranch);
  const setBranches = useBranchStore((s) => s.setBranches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const [products, setProducts] = useState([]);
  const [showCart, setShowCart] = useState(false);

  // Fetch branches from API
  useEffect(() => {
    async function loadBranches() {
      if (!orgSlug) return;
      try {
        const res = await fetch("/api/branches", {
          headers: { "x-org-slug": orgSlug },
        });
        const data = await res.json();
        const branchList = data.branches || [];
        setBranches(branchList);
        
        // Set first branch as active if none selected
        if (!branch && branchList.length > 0) {
          setBranch(branchList[0].id);
        }
      } catch (err) {
        console.error("Error loading branches:", err);
      }
    }
    loadBranches();
  }, [orgSlug]);

  // Fetch products when branch changes
  useEffect(() => {
    async function loadProducts() {
      if (!orgSlug || !branch) return;
      
      // Find branch name for inventory filter (case-insensitive)
      const branchObj = branches.find((b) => b.id === branch);
      const branchName = branchObj?.name || branch;
      
      const data = await inventoryService.getInventory(orgSlug, branchName);

      const list =
        Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
          ? data.items
          : Array.isArray(data?.data)
          ? data.data
          : [];

      setProducts(list);
    }
    loadProducts();
  }, [orgSlug, branch, branches]);

  return (
    <div className="flex flex-col h-full">
      {/* HEADER */}
      <div className="flex-shrink-0">
        <PosHeader onCartClick={() => setShowCart(!showCart)} showCart={showCart} />
      </div>

      {/* Mensaje si caja cerrada */}
      {!isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mx-2 mb-4">
          <p className="text-yellow-800 font-medium text-sm">
            La caja esta cerrada. Abre la caja para comenzar a vender.
          </p>
        </div>
      )}

      {/* MAIN CONTENT - Mobile: Stack, Desktop: Side by side */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* PRODUCTOS */}
        <div className={`flex-1 overflow-y-auto p-2 ${!isOpen ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {products.length === 0 ? (
              <p className="text-slate-500 text-sm col-span-full text-center py-8">
                No hay productos para esta bodega ({branch})
              </p>
            ) : (
              products.map((p, index) => (
                <ProductCard key={p.product_id || p.id || index} product={p} />
              ))
            )}
          </div>
        </div>

        {/* CARRITO - Mobile: Slide up panel, Desktop: Sidebar */}
        <div className={`
          lg:w-80 lg:flex-shrink-0
          ${!isOpen ? "opacity-50 pointer-events-none" : ""}
          
          /* Mobile styles */
          fixed lg:relative
          bottom-0 left-0 right-0 lg:bottom-auto lg:left-auto lg:right-auto
          z-40 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${showCart ? "translate-y-0" : "translate-y-full lg:translate-y-0"}
          
          /* Mobile height */
          max-h-[70vh] lg:max-h-none
          
          /* Background for mobile */
          bg-white lg:bg-transparent
          rounded-t-2xl lg:rounded-none
          shadow-2xl lg:shadow-none
        `}>
          {/* Mobile drag handle */}
          <div className="lg:hidden flex justify-center py-2">
            <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
          </div>
          
          <div className="h-full overflow-y-auto">
            <CartSidebar orgSlug={orgSlug} onClose={() => setShowCart(false)} />
          </div>
        </div>

        {/* Mobile overlay */}
        {showCart && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowCart(false)}
          />
        )}
      </div>

      {/* Mobile Cart Toggle Button */}
      <button
        onClick={() => setShowCart(true)}
        className={`
          lg:hidden fixed bottom-4 right-4 z-20
          bg-emerald-600 text-white
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg
          ${!isOpen ? "opacity-50 pointer-events-none" : ""}
          ${showCart ? "hidden" : ""}
        `}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>
  );
}