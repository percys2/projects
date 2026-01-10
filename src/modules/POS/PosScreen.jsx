"use client";

import React, { useEffect, useState, useRef } from "react";
import { inventoryService } from "./services/inventoryService";
import { useBranchStore } from "./store/useBranchStore";
import { usePosStore } from "./store/usePosStore";
import { useCashRegisterStore } from "./store/useCashRegisterStore";
import { formatCurrency } from "./utils/formatCurrency";
import { salesService } from "./services/salesService";

import OpenCashModal from "./components/OpenCashModal";
import CloseCashButton from "./components/CloseCashButton";
import CashClosingHistory from "./components/CashClosingHistory";
import CustomerHeader from "./components/CustomerHeader";
import CustomerSelector from "./components/CustomerSelector";
import CustomerForm from "./components/CustomerForm";
import CartSidebar from "./components/CartSidebar";
import MenudeoModal from "./components/MenudeoModal";
import CreditSettingsModal from "./components/CreditSettingsModal";
import CreditHistoryModal from "./components/CreditHistoryModal";
import CreditPaymentModal from "./components/CreditPaymentModal";

const EMPTY_CART = [];
const DEFAULT_BRANCH_STATE = { isOpen: false, openingAmount: 0, movements: [], dayChangedWhileOpen: false };

export default function PosScreen({ orgSlug }) {
  const branches = useBranchStore((s) => s.branches);
  const branch = useBranchStore((s) => s.activeBranch);
  const setBranches = useBranchStore((s) => s.setBranches);
  const setBranch = useBranchStore((s) => s.setBranch);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);
  
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showCreditSettings, setShowCreditSettings] = useState(false);
    const [showCreditHistory, setShowCreditHistory] = useState(false);
    const [showCreditPayment, setShowCreditPayment] = useState(false);
    const [creditClient, setCreditClient] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cash");

  const cartData = usePosStore((s) => s.carts[branch]);
  const cart = cartData ?? EMPTY_CART;
  const addToCartStore = usePosStore((s) => s.addToCart);
  const removeFromCartStore = usePosStore((s) => s.removeFromCart);
  const decreaseQtyStore = usePosStore((s) => s.decreaseQty);
  const increaseQtyStore = usePosStore((s) => s.increaseQty);
  const updateCartQtyStore = usePosStore((s) => s.updateCartQty);
  const clearCartStore = usePosStore((s) => s.clearCart);
  const selectedClient = usePosStore((s) => s.selectedClient);
  const customerForm = usePosStore((s) => s.customerForm);

    const getItemId = (item) => item.id || item.product_id;
    const addToCart = (product) => addToCartStore(branch, product);
    const removeFromCart = (item) => removeFromCartStore(branch, getItemId(item));
    const decreaseQty = (item) => decreaseQtyStore(branch, getItemId(item));
    const increaseQty = (item) => increaseQtyStore(branch, getItemId(item));
    const updateCartQty = (item, qty) => updateCartQtyStore(branch, getItemId(item), qty);
    const clearCart = () => clearCartStore(branch);

  const branchStateData = useCashRegisterStore((s) => s.branches[branch]);
  const branchState = branchStateData ?? DEFAULT_BRANCH_STATE;
  const addMovementStore = useCashRegisterStore((s) => s.addMovement);
  const getTotalStore = useCashRegisterStore((s) => s.getTotal);
  const checkAndResetForNewDayStore = useCashRegisterStore((s) => s.checkAndResetForNewDay);
  const clearDayChangedWarningStore = useCashRegisterStore((s) => s.clearDayChangedWarning);
  
  const isCashOpen = branchState.isOpen;
  const movements = branchState.movements || [];
  const openingAmount = branchState.openingAmount || 0;
  const dayChangedWhileOpen = branchState.dayChangedWhileOpen;
  
  const addMovement = (movement) => addMovementStore(branch, movement);
  const getTotal = () => getTotalStore(branch);
  const checkAndResetForNewDay = () => checkAndResetForNewDayStore(branch);
  const clearDayChangedWarning = () => clearDayChangedWarningStore(branch);

    const [showDayDetail, setShowDayDetail] = useState(false);
    const [daySales, setDaySales] = useState([]);
    const [daySalesTotal, setDaySalesTotal] = useState(0);
    const [loadingDaySales, setLoadingDaySales] = useState(false);
        const [showCashHistory, setShowCashHistory] = useState(false);
      const [isPastClosingTime, setIsPastClosingTime] = useState(false);
      const [showMenudeoModal, setShowMenudeoModal] = useState(false);

    const CLOSING_HOUR = 19; // 7:00 PM

    const getTodayManagua = () => {
      return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
    };

    const getCurrentHourManagua = () => {
      const now = new Date();
      const managua = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Managua",
        hour: "numeric",
        hour12: false,
      }).format(now);
      return parseInt(managua, 10);
    };

    // Check if it's past closing time every minute
    useEffect(() => {
      const checkClosingTime = () => {
        const currentHour = getCurrentHourManagua();
        setIsPastClosingTime(currentHour >= CLOSING_HOUR);
      };
    
      checkClosingTime();
      const interval = setInterval(checkClosingTime, 60000); // Check every minute
    
      return () => clearInterval(interval);
    }, []);

  const loadDaySales = async () => {
    if (!orgSlug) return;
    setLoadingDaySales(true);
    try {
      const today = getTodayManagua();
      const url = `/api/sales?date=${today}${branch ? `&branchId=${branch}` : ''}`;
      const res = await fetch(url, {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      const sales = data.sales || [];
      setDaySales(sales);
      const validSales = sales.filter(s => s.status !== 'canceled' && s.status !== 'refunded');
      setDaySalesTotal(validSales.reduce((acc, s) => acc + (Number(s.total) || 0), 0));
    } catch (err) {
      console.error("Error loading day sales:", err);
      setDaySales([]);
      setDaySalesTotal(0);
    }
    setLoadingDaySales(false);
  };

  useEffect(() => {
    if (showDayDetail) {
      loadDaySales();
    }
  }, [showDayDetail]);

  useEffect(() => {
    if (orgSlug && isCashOpen) {
      loadDaySales();
    }
  }, [orgSlug, branch, isCashOpen]);

  useEffect(() => {
    checkAndResetForNewDay();
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
    async function load() {
      const data = await inventoryService.getInventory(orgSlug, branch);
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
    if (orgSlug) load();
  }, [orgSlug, branch]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const results = products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.code?.toLowerCase().includes(term)
    );
    setSearchResults(results.slice(0, 10));
    setShowResults(true);
  }, [searchTerm, products]);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      addToCart(searchResults[0]);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  const handleSelectProduct = (product) => {
    addToCart(product);
    setSearchTerm("");
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const total = subtotal;

    const handleOpenCreditSettings = (client) => {
      setCreditClient(client);
      setShowCreditSettings(true);
    };

    const handleOpenCreditHistory = (client) => {
      setCreditClient(client);
      setShowCreditHistory(true);
    };

    const handleOpenCreditPayment = (client) => {
      setCreditClient(client);
      setShowCreditPayment(true);
    };

    const handleCreditSettingsSuccess = (updatedClient) => {
      const setClient = usePosStore.getState().setClient;
      setClient(updatedClient);
    };

    const canSellOnCredit = () => {
      if (!selectedClient?.is_credit_client) return false;
      const available = (selectedClient.credit_limit || 0) - (selectedClient.credit_balance || 0);
      return total <= available;
    };

    const handleSale = async (useCredit = false) => {
      try {
        const { toast } = require("@/src/lib/notifications/toast");
        if (!isCashOpen) {
          toast.error("Abra la caja antes de vender.");
          return;
        }

        if (cart.length === 0) {
          toast.error("El carrito esta vacio.");
          return;
        }

        if (useCredit) {
          if (!selectedClient?.is_credit_client) {
            toast.error("Seleccione un cliente de credito.");
            return;
          }
          const available = (selectedClient.credit_limit || 0) - (selectedClient.credit_balance || 0);
          if (total > available) {
            toast.error(`Credito insuficiente. Disponible: C$ ${available.toFixed(2)}`);
            return;
          }
        }

        const sale = await salesService.makeSale({
          orgSlug,
          client: selectedClient || customerForm,
          cart,
          paymentType: useCredit ? "credit" : "cash",
          branchId: branch,
        });

        if (!useCredit) {
          addMovement({
            type: "entrada",
            amount: sale.total,
            description: `Venta ${sale.invoice}`,
            time: new Date(),
          });
        }

        clearCart();
        setPaymentMethod("cash");
      
        if (useCredit) {
          toast.success(`Venta a credito realizada. Factura: ${sale.invoice}`);
          const setClient = usePosStore.getState().setClient;
          if (selectedClient) {
            setClient({
              ...selectedClient,
              credit_balance: (selectedClient.credit_balance || 0) + total
            });
          }
        } else {
          toast.success(`Venta realizada. Factura: ${sale.invoice}`);
        }
      
        loadDaySales();
      } catch (error) {
        const { toast } = require("@/src/lib/notifications/toast");
        toast.error(error.message || "Error al realizar la venta");
      }
    };
  // Block POS if it's past closing time and cash register is still open
  const shouldBlockPOS = isPastClosingTime && isCashOpen;

  return (
    <div className="flex flex-col h-full bg-slate-100 relative">
      {/* Blocking overlay when past closing time */}
            {shouldBlockPOS && (
              <div className="absolute inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Hora de Cierre</h2>
                  <p className="text-slate-600 mb-4">
                    Son las 7:00 PM o mas tarde. Debe cerrar la caja antes de continuar.
                    Por favor realice el cotejo de dinero y cierre la caja.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Importante:</strong> No podra realizar mas ventas hasta cerrar la caja del dia.
                    </p>
                  </div>
                  <CloseCashButton orgSlug={orgSlug} daySalesTotal={daySalesTotal} />
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Puede acceder a otros modulos:</p>
                    <div className="flex gap-2 justify-center">
                      <a href={`/${orgSlug}/inventory`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">Inventario</a>
                      <a href={`/${orgSlug}/sales`} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium">Ventas</a>
                    </div>
                  </div>
                </div>
              </div>
            )}

      {/* Header with search */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex items-center gap-2 lg:gap-4">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="lg:hidden p-2 hover:bg-blue-500 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold hidden lg:block">POS</h1>
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Buscar producto..."
              className="w-full px-4 py-2 rounded text-slate-800 text-sm"
              autoFocus
            />
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-b shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id || product.product_id || index}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-3 lg:py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{product.name}</p>
                        <p className="text-xs text-slate-500">{product.sku || product.code || ""}</p>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setShowMobileCart(true)}
            className="lg:hidden p-2 hover:bg-blue-500 rounded-lg relative"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cart.reduce((acc, item) => acc + item.qty, 0)}
              </span>
            )}
          </button>
        </div>
      </div>

      {dayChangedWhileOpen && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="min-w-0">
                <p className="text-red-800 font-medium text-sm">Cierre de caja pendiente</p>
                <p className="text-red-600 text-xs hidden sm:block">La caja quedo abierta. Realice el cierre antes de continuar.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CloseCashButton orgSlug={orgSlug} daySalesTotal={daySalesTotal} />
              <button
                onClick={clearDayChangedWarning}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-2 lg:p-4 overflow-hidden">
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="bg-slate-50 border-b hidden lg:block">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-slate-600 uppercase">
                <div className="col-span-1">Accion</div>
                <div className="col-span-5">Nombre</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-2 text-center">Cant.</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">No hay productos en el carrito</p>
                    <p className="text-xs mt-1">Busque un producto para agregarlo</p>
                  </div>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={item.id || index}>
                    <div className="lg:hidden p-3 border-b border-slate-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.sku || item.code || ""} - {formatCurrency(item.price)} c/u</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item)}
                          className="text-red-500 hover:text-red-700 p-2 ml-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decreaseQty(item)}
                            className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-12 text-center text-base font-medium">{item.qty}</span>
                          <button
                            onClick={() => increaseQty(item)}
                            className="w-10 h-10 bg-slate-200 hover:bg-slate-300 rounded-lg text-lg font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-base font-bold text-slate-800">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    </div>
                    
                    <div className="hidden lg:grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 items-center">
                      <div className="col-span-1">
                        <button
                          onClick={() => removeFromCart(item)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Eliminar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.sku || item.code || ""}</p>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm text-slate-800">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-center gap-1">
                        <button
                          onClick={() => decreaseQty(item)}
                          className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateCartQty(item, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border rounded py-1 text-sm"
                          min="1"
                        />
                        <button
                          onClick={() => increaseQty(item)}
                          className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                      <div className="col-span-2 text-right">
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(item.qty * item.price)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-2 lg:mt-4 bg-white rounded-lg shadow p-3 lg:p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <span>Articulos: </span>
                <span className="font-bold">{cart.reduce((acc, item) => acc + item.qty, 0)}</span>
              </div>
              <div className="flex items-center gap-4 lg:gap-8">
                <div className="text-right hidden lg:block">
                  <p className="text-sm text-slate-600">Subtotal:</p>
                  <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs lg:text-sm text-slate-600">Total:</p>
                  <p className="text-xl lg:text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </div>

                    <div className="mt-2 lg:mt-4 flex gap-2 lg:gap-4" style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
                      <button
                        onClick={() => handleSale(false)}
                        disabled={cart.length === 0 || !isCashOpen}
                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 lg:py-3 rounded-lg font-bold text-base lg:text-lg min-h-[48px]"
                      >
                        Efectivo
                      </button>
                      {selectedClient?.is_credit_client && (
                        <button
                          onClick={() => handleSale(true)}
                          disabled={cart.length === 0 || !isCashOpen || !canSellOnCredit()}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 lg:py-3 rounded-lg font-bold text-base lg:text-lg min-h-[48px]"
                          title={!canSellOnCredit() ? "Credito insuficiente" : ""}
                        >
                          Credito
                        </button>
                      )}
                      <button
                        onClick={clearCart}
                        disabled={cart.length === 0}
                        className="px-4 lg:px-6 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium min-h-[48px]"
                      >
                        Vaciar
                      </button>
                    </div>
        </div>
        <div className="hidden lg:flex w-80 bg-slate-100 p-3 flex-col gap-3 overflow-y-auto">
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <label className="text-xs font-medium text-slate-600">Sucursal</label>
            <select
              className="w-full mt-1 text-sm border rounded px-2 py-1.5"
              value={branch || ""}
              onChange={(e) => setBranch(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-600">Estado de Caja</span>
              <span className={`text-xs px-2 py-0.5 rounded ${isCashOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isCashOpen ? 'Abierta' : 'Cerrada'}
              </span>
            </div>
            {isCashOpen && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Total en caja:</span>
                                    <span className="font-bold">
                                      {formatCurrency(openingAmount + movements.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.amount, 0) + movements.filter(m => m.subtype === 'menudeo').reduce((acc, m) => acc + m.amount, 0) - movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDayDetail(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded text-xs"
                  >
                    Detalle del Dia
                  </button>
                  <CloseCashButton orgSlug={orgSlug} daySalesTotal={daySalesTotal} />
                </div>
              </div>
            )}
                      <button
                        onClick={() => setShowCashHistory(true)}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white py-1.5 rounded text-xs mt-2"
                      >
                        Historial de Cierres
                      </button>
                      {isCashOpen && (
                        <button
                          onClick={() => setShowMenudeoModal(true)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-1.5 rounded text-xs mt-2"
                        >
                          Registrar Menudeo
                        </button>
                      )}
                    </div>

                    <div className="bg-white rounded-lg p-3 shadow-sm space-y-2">
                      <p className="text-xs font-medium text-slate-600">Cliente</p>
                        <CustomerHeader />
                        <CustomerSelector 
                          onCreditSettings={handleOpenCreditSettings}
                          onCreditHistory={handleOpenCreditHistory}
                        />
                        <CustomerForm />
          </div>

          <div className="mt-auto space-y-2">
            <a href={`/${orgSlug}/inventory`} className="block bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium text-sm">
              Inventario
            </a>
            <a href={`/${orgSlug}/sales`} className="block bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg text-center font-medium text-sm">
              Ventas
            </a>
          </div>
        </div>
      </div>

      <OpenCashModal orgSlug={orgSlug} />

      {showDayDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="bg-slate-800 text-white p-4 rounded-t-xl">
              <h2 className="text-lg font-bold">Detalle del Dia</h2>
              <p className="text-sm text-slate-300">Resumen de ventas - {getTodayManagua()}</p>
            </div>
            <div className="p-4 space-y-4">
              {loadingDaySales ? (
                <div className="text-center py-8"><p className="text-slate-500 text-sm">Cargando ventas...</p></div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Monto de apertura:</span>
                      <span className="font-bold">{formatCurrency(openingAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Total de ventas (BD):</span>
                      <span className="font-bold text-green-600">{formatCurrency(daySalesTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600 text-purple-600">+ Menudeo:</span>
                      <span className="font-bold text-purple-600">
                        {formatCurrency(movements.filter(m => m.subtype === 'menudeo' && m.branchId === branch).reduce((acc, m) => acc + m.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Retiros de caja:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                      </span>
                    </div>
                                        <div className="flex justify-between text-sm pt-2 border-t">
                                          <span className="font-bold">Total en caja:</span>
                                          <span className="font-bold text-blue-600">
                                            {formatCurrency(openingAmount + movements.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.amount, 0) + movements.filter(m => m.subtype === 'menudeo').reduce((acc, m) => acc + m.amount, 0) - movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                                          </span>
                                        </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Ventas del dia ({daySales.length})</h3>
                      <button onClick={loadDaySales} className="text-xs text-blue-600 hover:text-blue-800">Actualizar</button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {daySales.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No hay ventas hoy</p>
                      ) : (
                        daySales.map((sale, i) => (
                          <div key={sale.id || i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                            <div>
                              <p className="font-medium">Factura #{sale.factura || sale.id?.slice(0, 8)}</p>
                              <p className="text-slate-400">{sale.client_name || sale.clients?.name || 'Sin cliente'} - {new Date(sale.created_at).toLocaleTimeString('es-NI')}</p>
                            </div>
                            <span className="text-green-600 font-bold">+{formatCurrency(sale.total)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
              <button onClick={() => setShowDayDetail(false)} className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium">Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl overflow-y-auto">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">Menu</h2>
              <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-blue-500 rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <label className="text-xs font-medium text-slate-600">Sucursal</label>
                <select className="w-full mt-1 text-sm border rounded px-3 py-2" value={branch || ""} onChange={(e) => setBranch(e.target.value)}>
                  {branches.map((b) => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-600">Estado de Caja</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${isCashOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isCashOpen ? 'Abierta' : 'Cerrada'}
                  </span>
                </div>
                {isCashOpen && (
                  <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                          <span className="text-slate-500">Total en caja:</span>
                                          <span className="font-bold">
                                            {formatCurrency(openingAmount + movements.filter(m => m.type === 'entrada').reduce((acc, m) => acc + m.amount, 0) + movements.filter(m => m.subtype === 'menudeo').reduce((acc, m) => acc + m.amount, 0) - movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                                          </span>
                                        </div>
                                        <div className="flex gap-2">
                                          <button onClick={() => { setShowDayDetail(true); setShowMobileMenu(false); }}className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded text-xs">
                        Detalle del Dia
                      </button>
                      <CloseCashButton orgSlug={orgSlug} daySalesTotal={daySalesTotal} />
                    </div>
                  </div>
                )}
                              <button onClick={() => { setShowCashHistory(true); setShowMobileMenu(false); }} className="w-full bg-slate-600 hover:bg-slate-700 text-white py-2 rounded text-xs mt-2">
                                Historial de Cierres
                              </button>
                              {isCashOpen && (
                                <button onClick={() => { setShowMenudeoModal(true); setShowMobileMenu(false); }} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded text-xs mt-2">
                                  Registrar Menudeo
                                </button>
                              )}
                            </div>

                                                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                                          <p className="text-xs font-medium text-slate-600">Cliente</p>
                                                          <CustomerHeader />
                                                          <CustomerSelector 
                                                            onCreditSettings={(c) => { handleOpenCreditSettings(c); setShowMobileMenu(false); }}
                                                            onCreditHistory={(c) => { handleOpenCreditHistory(c); setShowMobileMenu(false); }}
                                                          />
                                                          <CustomerForm />
                                                        </div>

                                                        <div className="space-y-2 pt-4 border-t">
                <a href={`/${orgSlug}/inventory`} className="block bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium text-sm">Inventario</a>
                <a href={`/${orgSlug}/sales`} className="block bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg text-center font-medium text-sm">Ventas</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileCart(false)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl">
            <CartSidebar orgSlug={orgSlug} onClose={() => { setShowMobileCart(false); searchInputRef.current?.focus(); }} onSaleSuccess={loadDaySales} />
          </div>
        </div>
      )}

      {showCashHistory && (
        <CashClosingHistory orgSlug={orgSlug} onClose={() => setShowCashHistory(false)} />
      )}

      {showMenudeoModal && (
        <MenudeoModal orgSlug={orgSlug} branchId={branch} onClose={() => setShowMenudeoModal(false)} />
      )}

      {showCreditSettings && creditClient && (
        <CreditSettingsModal
          client={creditClient}
          orgSlug={orgSlug}
          onClose={() => { setShowCreditSettings(false); setCreditClient(null); }}
          onSuccess={handleCreditSettingsSuccess}
        />
      )}

      {showCreditHistory && creditClient && (
        <CreditHistoryModal
          client={creditClient}
          orgSlug={orgSlug}
          onClose={() => { setShowCreditHistory(false); setCreditClient(null); }}
          onPayment={(c) => { setShowCreditHistory(false); handleOpenCreditPayment(c); }}
        />
      )}

      {showCreditPayment && creditClient && (
        <CreditPaymentModal
          client={creditClient}
          orgSlug={orgSlug}
          branchId={branch}
          onClose={() => { setShowCreditPayment(false); setCreditClient(null); }}
          onSuccess={() => {
            const { toast } = require("@/src/lib/notifications/toast");
            toast.success("Pago registrado exitosamente");
          }}
        />
      )}
    </div>
  );
}
