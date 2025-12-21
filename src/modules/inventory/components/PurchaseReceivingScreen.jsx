"use client";

import React, { useState, useEffect, useMemo } from "react";

export default function PurchaseReceivingScreen({ orgSlug, branches = [], products = [], suppliers = [], onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState("receive");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [supplierInvoice, setSupplierInvoice] = useState("");
  const [receiveItems, setReceiveItems] = useState([]);
  const [notes, setNotes] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [lot, setLot] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, [orgSlug]);

  const loadPurchases = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/purchases", {
        headers: { "x-org-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases || []);
      }
    } catch (err) {
      console.error("Error loading purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products.slice(0, 50);
    const term = productSearch.toLowerCase();
    return products.filter(
      (p) => p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term)
    );
  }, [products, productSearch]);

  const uniqueProducts = useMemo(() => {
    const seen = new Set();
    return products.filter((p) => {
      const id = p.productId || p.product_id;
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  }, [products]);

  const handleAddItem = () => {
    if (!selectedProductId || !qty || Number(qty) <= 0) {
      alert("Seleccione un producto y cantidad valida");
      return;
    }
    if (!cost || Number(cost) <= 0) {
      alert("Ingrese el costo unitario");
      return;
    }

    const product = uniqueProducts.find((p) => (p.productId || p.product_id) === selectedProductId);
    if (!product) return;

    const existingIndex = receiveItems.findIndex(
      (i) => i.productId === selectedProductId && i.lot === lot && i.expiresAt === expiresAt
    );

    if (existingIndex >= 0) {
      const newItems = [...receiveItems];
      newItems[existingIndex].qty += Number(qty);
      setReceiveItems(newItems);
    } else {
      setReceiveItems([
        ...receiveItems,
        {
          productId: selectedProductId,
          productName: product.name,
          sku: product.sku || "",
          qty: Number(qty),
          cost: Number(cost),
          lot: lot || null,
          expiresAt: expiresAt || null,
          total: Number(qty) * Number(cost),
        },
      ]);
    }

    setSelectedProductId("");
    setQty("");
    setCost("");
    setLot("");
    setExpiresAt("");
    setProductSearch("");
  };

  const handleRemoveItem = (index) => {
    setReceiveItems(receiveItems.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    return receiveItems.reduce(
      (acc, item) => {
        acc.items += 1;
        acc.units += item.qty;
        acc.cost += item.qty * item.cost;
        return acc;
      },
      { items: 0, units: 0, cost: 0 }
    );
  }, [receiveItems]);

  const handleSubmit = async () => {
    if (!selectedBranch) {
      alert("Seleccione una sucursal");
      return;
    }
    if (receiveItems.length === 0) {
      alert("Agregue al menos un producto");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/inventory/purchases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          branchId: selectedBranch,
          supplierId: selectedSupplier || null,
          supplierInvoice: supplierInvoice || null,
          notes,
          items: receiveItems,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al registrar compra");
      }

      alert("Compra registrada exitosamente");
      setSelectedBranch("");
      setSelectedSupplier("");
      setSupplierInvoice("");
      setReceiveItems([]);
      setNotes("");
      loadPurchases();
      onSuccess?.();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Compras y Recepciones</h2>
              <p className="text-xs text-slate-500 mt-1">
                Registre entradas de inventario con proveedor, lote y vencimiento
              </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
              &times;
            </button>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab("receive")}
              className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${
                activeTab === "receive" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              + Nueva Recepcion
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${
                activeTab === "history" ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              Historial ({purchases.length})
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeTab === "receive" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Sucursal *</label>
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg"
                  >
                    <option value="">Seleccionar...</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Proveedor</label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-2 text-sm border rounded-lg"
                  >
                    <option value="">Sin proveedor</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Factura Proveedor</label>
                  <input
                    type="text"
                    value={supplierInvoice}
                    onChange={(e) => setSupplierInvoice(e.target.value)}
                    placeholder="# Factura"
                    className="w-full p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Notas</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas..."
                    className="w-full p-2 text-sm border rounded-lg"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Agregar producto</h3>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-slate-600 block mb-1">Producto</label>
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full p-2 text-xs border rounded-lg mb-1"
                    />
                    <select
                      value={selectedProductId}
                      onChange={(e) => {
                        setSelectedProductId(e.target.value);
                        const prod = uniqueProducts.find((p) => (p.productId || p.product_id) === e.target.value);
                        if (prod?.cost) setCost(String(prod.cost));
                      }}
                      className="w-full p-2 text-xs border rounded-lg"
                    >
                      <option value="">Seleccionar...</option>
                      {filteredProducts.map((p) => (
                        <option key={p.productId || p.product_id} value={p.productId || p.product_id}>
                          {p.name} {p.sku ? `(${p.sku})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Cantidad</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      placeholder="0"
                      min="1"
                      className="w-full p-2 text-xs border rounded-lg mt-5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Costo Unit.</label>
                    <input
                      type="number"
                      value={cost}
                      onChange={(e) => setCost(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      className="w-full p-2 text-xs border rounded-lg mt-5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Lote</label>
                    <input
                      type="text"
                      value={lot}
                      onChange={(e) => setLot(e.target.value)}
                      placeholder="Lote..."
                      className="w-full p-2 text-xs border rounded-lg mt-5"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 block mb-1">Vencimiento</label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="w-full p-2 text-xs border rounded-lg mt-5"
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAddItem}
                    disabled={!selectedProductId || !qty || !cost}
                    className={`px-4 py-2 text-xs rounded-lg font-semibold ${
                      selectedProductId && qty && cost
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>

              {receiveItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-3 border-b">
                    <h3 className="text-sm font-semibold text-slate-700">
                      Productos a recibir ({receiveItems.length})
                    </h3>
                  </div>
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 text-left">Producto</th>
                        <th className="p-2 text-center">Cantidad</th>
                        <th className="p-2 text-right">Costo</th>
                        <th className="p-2 text-right">Total</th>
                        <th className="p-2 text-center">Lote</th>
                        <th className="p-2 text-center">Vence</th>
                        <th className="p-2 text-center">Quitar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiveItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">
                            <span className="font-medium">{item.productName}</span>
                            {item.sku && <span className="text-slate-400 ml-1">({item.sku})</span>}
                          </td>
                          <td className="p-2 text-center font-semibold">{item.qty}</td>
                          <td className="p-2 text-right">C$ {item.cost.toLocaleString("es-NI")}</td>
                          <td className="p-2 text-right font-semibold">
                            C$ {(item.qty * item.cost).toLocaleString("es-NI")}
                          </td>
                          <td className="p-2 text-center">{item.lot || "-"}</td>
                          <td className="p-2 text-center">{item.expiresAt || "-"}</td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-500 hover:text-red-700 font-bold"
                            >
                              &times;
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-100">
                      <tr>
                        <td className="p-2 font-semibold">Total</td>
                        <td className="p-2 text-center font-semibold">{totals.units}</td>
                        <td className="p-2"></td>
                        <td className="p-2 text-right font-bold text-emerald-600">
                          C$ {totals.cost.toLocaleString("es-NI")}
                        </td>
                        <td colSpan={3}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-slate-400">Cargando...</div>
              ) : purchases.length === 0 ? (
                <div className="text-center py-8 text-slate-400">No hay compras registradas</div>
              ) : (
                purchases.map((p) => (
                  <div key={p.id} className="border rounded-lg p-4 hover:bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">
                          Compra #{p.order_number || p.id.slice(0, 8)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {p.branch_name} - {p.supplier_name || "Sin proveedor"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(p.created_at).toLocaleDateString("es-NI")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">
                          C$ {Number(p.total || 0).toLocaleString("es-NI")}
                        </p>
                        {p.supplier_invoice && (
                          <p className="text-xs text-slate-500">Fact: {p.supplier_invoice}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            {activeTab === "receive" && receiveItems.length > 0 && (
              <div className="text-sm">
                <span className="text-slate-600">Total: </span>
                <span className="font-bold text-slate-800">{totals.items} productos, {totals.units} unidades</span>
                <span className="ml-2 text-emerald-600 font-semibold">
                  (C$ {totals.cost.toLocaleString("es-NI")})
                </span>
              </div>
            )}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                Cerrar
              </button>
              {activeTab === "receive" && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || receiveItems.length === 0 || !selectedBranch}
                  className={`px-6 py-2 text-sm rounded-lg font-semibold ${
                    submitting || receiveItems.length === 0 || !selectedBranch
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {submitting ? "Guardando..." : "Registrar Compra"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
