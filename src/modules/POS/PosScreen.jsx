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
import CustomerHeader from "./components/CustomerHeader";
import CustomerSelector from "./components/CustomerSelector";
import CustomerForm from "./components/CustomerForm";

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

  // Cart store
  const cart = usePosStore((s) => s.cart);
  const addToCart = usePosStore((s) => s.addToCart);
  const removeFromCart = usePosStore((s) => s.removeFromCart);
  const decreaseQty = usePosStore((s) => s.decreaseQty);
  const increaseQty = usePosStore((s) => s.increaseQty);
  const updateCartQty = usePosStore((s) => s.updateCartQty);
  const clearCart = usePosStore((s) => s.clearCart);
  const selectedClient = usePosStore((s) => s.selectedClient);
  const customerForm = usePosStore((s) => s.customerForm);

  // Cash register store
  const isCashOpen = useCashRegisterStore((s) => s.isOpen);
  const addMovement = useCashRegisterStore((s) => s.addMovement);
  const movements = useCashRegisterStore((s) => s.movements);
  const openingAmount = useCashRegisterStore((s) => s.openingAmount);
  const getTotal = useCashRegisterStore((s) => s.getTotal);
  const checkAndResetForNewDay = useCashRegisterStore((s) => s.checkAndResetForNewDay);
  const dayChangedWhileOpen = useCashRegisterStore((s) => s.dayChangedWhileOpen);
  const clearDayChangedWarning = useCashRegisterStore((s) => s.clearDayChangedWarning);

  // State for day detail modal
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [daySales, setDaySales] = useState([]);
  const [daySalesTotal, setDaySalesTotal] = useState(0);
  const [loadingDaySales, setLoadingDaySales] = useState(false);

  // Get today's date in Managua timezone
  const getTodayManagua = () => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
  };

  // Load day sales from DB when modal opens
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
      setDaySalesTotal(sales.reduce((acc, s) => acc + (Number(s.total) || 0), 0));
    } catch (err) {
      console.error("Error loading day sales:", err);
      setDaySales([]);
      setDaySalesTotal(0);
    }
    setLoadingDaySales(false);
  };

  // Load sales when modal opens or on mount/branch change
  useEffect(() => {
    if (showDayDetail) {
      loadDaySales();
    }
  }, [showDayDetail]);

  // Load sales on mount and when branch changes (for sidebar total)
  useEffect(() => {
    if (orgSlug && isCashOpen) {
      loadDaySales();
    }
  }, [orgSlug, branch, isCashOpen]);

  // Check and reset for new day on mount
  useEffect(() => {
    checkAndResetForNewDay();
  }, []);

  // Load branches
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

  // Load products
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

  // Search products
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

  // Handle search input
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchResults.length > 0) {
      addToCart(searchResults[0]);
      setSearchTerm("");
      setShowResults(false);
    }
  };

  // Handle product selection from search
  const handleSelectProduct = (product) => {
    addToCart(product);
    setSearchTerm("");
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.qty * item.price, 0);
  const total = subtotal;

  // Handle sale
  const handleSale = async () => {
    try {
      const { toast } = require("@/src/lib/notifications/toast");
      if (!isCashOpen) {
        toast.error("Abra la caja antes de vender.");
        return;
      }

      if (cart.length === 0) {
        toast.error("El carrito está vacío.");
        return;
      }

      const sale = await salesService.makeSale({
        orgSlug,
        client: selectedClient || customerForm,
        cart,
        paymentType: "efectivo",
        branchId: branch,
      });

      addMovement({
        type: "entrada",
        amount: sale.total,
        description: `Venta ${sale.invoice}`,
        time: new Date(),
      });

      clearCart();
      toast.success(`Venta realizada. Factura: ${sale.invoice}`);
    } catch (error) {
      const { toast } = require("@/src/lib/notifications/toast");
      toast.error(error.message || "Error al realizar la venta");
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-100">
      {/* Header with search */}
      <div className="bg-blue-600 text-white p-3">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold">POS</h1>
          <div className="flex-1 relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Escanee o ingrese el codigo de articulo"
              className="w-full px-4 py-2 rounded text-slate-800 text-sm"
              autoFocus
            />
            {/* Search results dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-300 rounded-b shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((product, index) => (
                  <div
                    key={product.id || product.product_id || index}
                    onClick={() => handleSelectProduct(product)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-slate-100 last:border-b-0"
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
        </div>
      </div>

      {/* Warning if day changed while cash register was open */}
      {dayChangedWhileOpen && (
        <div className="bg-red-50 border-b border-red-200 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-red-800 font-medium text-sm">Cierre de caja pendiente del dia anterior</p>
                <p className="text-red-600 text-xs">La caja quedo abierta. Realice el cierre antes de continuar.</p>
              </div>
            </div>
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
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left side - Table */}
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Table */}
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            {/* Table header */}
            <div className="bg-slate-50 border-b">
              <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-semibold text-slate-600 uppercase">
                <div className="col-span-1">Accion</div>
                <div className="col-span-5">Nombre</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-2 text-center">Cant.</div>
                <div className="col-span-2 text-right">Subtotal</div>
              </div>
            </div>

            {/* Table body */}
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
                  <div
                    key={item.id || index}
                    className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 items-center"
                  >
                    {/* Action */}
                    <div className="col-span-1">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Name */}
                    <div className="col-span-5">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.sku || item.code || ""}</p>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm text-slate-800">{formatCurrency(item.price)}</p>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex items-center justify-center gap-1">
                      <button
                        onClick={() => decreaseQty(item.id)}
                        className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateCartQty(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center border rounded py-1 text-sm"
                        min="1"
                      />
                      <button
                        onClick={() => increaseQty(item.id)}
                        className="w-7 h-7 bg-slate-200 hover:bg-slate-300 rounded text-sm font-bold flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right">
                      <p className="text-sm font-bold text-slate-800">{formatCurrency(item.qty * item.price)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom summary */}
          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                <span>Conteo de articulos: </span>
                <span className="font-bold">{cart.reduce((acc, item) => acc + item.qty, 0)}</span>
              </div>
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-sm text-slate-600">Subtotal:</p>
                  <p className="text-lg font-bold">{formatCurrency(subtotal)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-600">Total:</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(total)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSale}
              disabled={cart.length === 0 || !isCashOpen}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-lg"
            >
              Finalizar Venta
            </button>
            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="px-6 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium"
            >
              Vaciar
            </button>
          </div>
        </div>

        {/* Right side - Client info, Cash register, Navigation */}
        <div className="w-80 bg-slate-100 p-3 flex flex-col gap-3 overflow-y-auto">
          {/* Branch selector */}
          <div className="bg-white rounded-lg p-3 shadow-sm">
            <label className="text-xs font-medium text-slate-600">Sucursal</label>
            <select
              className="w-full mt-1 text-sm border rounded px-2 py-1.5"
              value={branch || ""}
              onChange={(e) => setBranch(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cash register status */}
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
                    {formatCurrency(openingAmount + daySalesTotal - movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDayDetail(true)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1.5 rounded text-xs"
                  >
                    Detalle del Dia
                  </button>
                  <CloseCashButton />
                </div>
              </div>
            )}
          </div>

          {/* Customer section */}
          <div className="bg-white rounded-lg p-3 shadow-sm space-y-2">
            <p className="text-xs font-medium text-slate-600">Cliente</p>
            <CustomerHeader />
            <CustomerSelector />
            <CustomerForm />
          </div>

          {/* Navigation buttons */}
          <div className="mt-auto space-y-2">
            <a
              href={`/${orgSlug}/inventory`}
              className="block bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg text-center font-medium text-sm"
            >
              Inventario
            </a>
            <a
              href={`/${orgSlug}/sales`}
              className="block bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg text-center font-medium text-sm"
            >
              Ventas
            </a>
          </div>
        </div>
      </div>

      {/* Open Cash Modal */}
      <OpenCashModal />

      {/* Day Detail Modal */}
      {showDayDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="bg-slate-800 text-white p-4 rounded-t-xl">
              <h2 className="text-lg font-bold">Detalle del Dia</h2>
              <p className="text-sm text-slate-300">Resumen de ventas - {getTodayManagua()}</p>
            </div>
            <div className="p-4 space-y-4">
              {loadingDaySales ? (
                <div className="text-center py-8">
                  <p className="text-slate-500 text-sm">Cargando ventas...</p>
                </div>
              ) : (
                <>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Monto de apertura:</span>
                      <span className="font-bold">{formatCurrency(openingAmount)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Total de ventas (BD):</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(daySalesTotal)}
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
                        {formatCurrency(openingAmount + daySalesTotal - movements.filter(m => m.type === 'salida').reduce((acc, m) => acc + m.amount, 0))}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-semibold">Ventas del dia ({daySales.length})</h3>
                      <button
                        onClick={loadDaySales}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Actualizar
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {daySales.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">No hay ventas hoy</p>
                      ) : (
                        daySales.map((sale, i) => (
                          <div key={sale.id || i} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded">
                            <div>
                              <p className="font-medium">Factura #{sale.factura || sale.id?.slice(0, 8)}</p>
                              <p className="text-slate-400">
                                {sale.client_name || sale.clients?.name || 'Sin cliente'} - {new Date(sale.created_at).toLocaleTimeString('es-NI')}
                              </p>
                            </div>
                            <span className="text-green-600 font-bold">
                              +{formatCurrency(sale.total)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => setShowDayDetail(false)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
