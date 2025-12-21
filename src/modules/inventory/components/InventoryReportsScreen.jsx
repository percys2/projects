"use client";

import React, { useState, useRef, useEffect } from "react";

export default function BarcodeScannerModal({ isOpen, onClose, onScan, products = [] }) {
  const [manualCode, setManualCode] = useState("");
  const [lastScanned, setLastScanned] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findProduct = (code) => {
    const term = code.toLowerCase().trim();
    return products.find(
      (p) =>
        p.sku?.toLowerCase() === term ||
        p.productId?.toLowerCase() === term ||
        p.product_id?.toLowerCase() === term ||
        p.name?.toLowerCase().includes(term)
    );
  };

  const handleScan = (code) => {
    if (!code.trim()) return;

    const product = findProduct(code);
    const scanResult = {
      code,
      product,
      timestamp: new Date(),
      found: !!product,
    };

    setLastScanned(scanResult);
    setScanHistory((prev) => [scanResult, ...prev.slice(0, 9)]);

    if (product) {
      onScan?.(product);
    }

    setManualCode("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleScan(manualCode);
    }
  };

  const handleQuickAction = (action, product) => {
    onClose?.();
    if (action === "entry") {
      window.dispatchEvent(new CustomEvent("inventory-quick-action", { detail: { action: "entry", product } }));
    } else if (action === "exit") {
      window.dispatchEvent(new CustomEvent("inventory-quick-action", { detail: { action: "exit", product } }));
    } else if (action === "kardex") {
      window.dispatchEvent(new CustomEvent("inventory-quick-action", { detail: { action: "kardex", product } }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Escanear Codigo
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Escanee o ingrese el codigo del producto
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
              &times;
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escanee o escriba el codigo..."
              className="w-full p-4 text-lg border-2 border-blue-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-center font-mono"
              autoComplete="off"
              autoFocus
            />
            <button
              onClick={() => handleScan(manualCode)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>

          {lastScanned && (
            <div
              className={`p-4 rounded-xl border-2 ${
                lastScanned.found
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              {lastScanned.found ? (
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-slate-800">{lastScanned.product.name}</p>
                      <p className="text-sm text-slate-500">
                        SKU: {lastScanned.product.sku || "-"} | {lastScanned.product.category}
                      </p>
                      <p className="text-sm text-slate-500">
                        Sucursal: {lastScanned.product.branch || lastScanned.product.branch_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {lastScanned.product.stock || 0}
                      </p>
                      <p className="text-xs text-slate-500">en stock</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleQuickAction("entry", lastScanned.product)}
                      className="flex-1 px-3 py-3 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold"
                    >
                      + Entrada
                    </button>
                    <button
                      onClick={() => handleQuickAction("exit", lastScanned.product)}
                      className="flex-1 px-3 py-3 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold"
                    >
                      - Salida
                    </button>
                    <button
                      onClick={() => handleQuickAction("kardex", lastScanned.product)}
                      className="flex-1 px-3 py-3 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                    >
                      Historial
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-red-600 font-semibold">Producto no encontrado</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Codigo: <span className="font-mono">{lastScanned.code}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {scanHistory.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-600 uppercase mb-2">
                Historial de escaneos
              </h3>
              <div className="max-h-40 overflow-auto space-y-1">
                {scanHistory.map((scan, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center p-2 rounded text-xs ${
                      scan.found ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <span className="font-mono">{scan.code}</span>
                    <span className={scan.found ? "text-green-600" : "text-red-600"}>
                      {scan.found ? scan.product.name : "No encontrado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="text-center text-xs text-slate-500">
            <p>Conecte un lector de codigo de barras USB o use la camara del dispositivo</p>
            <p className="mt-1">El campo de texto captura automaticamente los escaneos</p>
          </div>
        </div>
      </div>
    </div>
  );
}