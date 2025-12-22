"use client";

import React, { useEffect, useState } from "react";
import { inventoryService } from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";
import { useCashRegisterStore } from "./store/useCashRegisterStore";

import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import PosHeader from "./components/PosHeader";

const OPENING_HOUR = 7;
const CLOSING_HOUR = 19;

function isWithinOperatingHours() {
  const now = new Date();
  const managuaTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Managua" }));
  const hour = managuaTime.getHours();
  return hour >= OPENING_HOUR && hour < CLOSING_HOUR;
}

function getManaguaTime() {
  const now = new Date();
  return now.toLocaleString("es-NI", { 
    timeZone: "America/Managua",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

export default function PosScreen({ orgSlug }) {
  const branches = useBranchStore((s) => s.branches);
  const branch = useBranchStore((s) => s.activeBranch);
  const setBranches = useBranchStore((s) => s.setBranches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const isOpen = useCashRegisterStore((s) => s.isOpen);
  const [products, setProducts] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [isOperatingHours, setIsOperatingHours] = useState(true);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const checkTime = () => {
      setIsOperatingHours(isWithinOperatingHours());
      setCurrentTime(getManaguaTime());
    };
    checkTime();
    const interval = setInterval(checkTime, 60000);
    return () => clearInterval(interval);
  }, []);

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
        if (!branch && branchList.length > 0) {
          setBranch(branchList[0].id);
        }
      } catch (err) {
        console.error("Error loading branches:", err);
      }
    }
    loadBranches();
  }, [orgSlug]);

  useEffect(() => {
    async function loadProducts() {
      if (!orgSlug || !branch) return;
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

  if (!isOperatingHours) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-900 text-white p-8">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">POS Cerrado</h1>
          <p className="text-slate-400 mb-4">
            El sistema de punto de venta opera de <span className="text-white font-semibold">7:00 AM a 7:00 PM</span>
          </p>
          <div className="bg-slate-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400">Hora actual (Managua)</p>
            <p className="text-3xl font-bold text-white">{currentTime}</p>
          </div>
          <p className="text-sm text-slate-500">
            Por favor regrese durante el horario de operacion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0">
        <PosHeader onCartClick={() => setShowCart(!showCart)} showCart={showCart} orgSlug={orgSlug} />
      </div>

      {!isOpen && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mx-2 mb-4">
          <p className="text-yellow-800 font-medium text-sm">
            La caja esta cerrada. Abre la caja para comenzar a vender.
          </p>
        </div>
      )}

      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
        {/* Product Grid - takes remaining space on mobile when cart is hidden */}
        <div className={`flex-1 overflow-y-auto p-2 ${!isOpen ? "opacity-50 pointer-events-none" : ""} ${showCart ? "hidden lg:block" : ""}`}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 pb-20 lg:pb-0">
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

        {/* Cart Sidebar - Full screen on mobile when shown */}
        <div className={`
          lg:w-80 lg:flex-shrink-0
          ${!isOpen ? "opacity-50 pointer-events-none" : ""}
          ${showCart ? "fixed inset-0 z-40 lg:relative lg:inset-auto" : "hidden lg:block"}
          bg-white lg:bg-transparent
        `}>
          <div className="h-full overflow-y-auto">
            <CartSidebar orgSlug={orgSlug} onClose={() => setShowCart(false)} />
          </div>
        </div>
      </div>

      {/* Floating Cart Button - Only visible on mobile when cart is hidden */}
      <button
        onClick={() => setShowCart(true)}
        className={`
          lg:hidden fixed bottom-6 right-4 z-20
          bg-emerald-600 text-white
          w-14 h-14 rounded-full
          flex items-center justify-center
          shadow-lg
          ${!isOpen ? "opacity-50 pointer-events-none" : ""}
          ${showCart ? "hidden" : ""}
        `}
        style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
    </div>
  );
}