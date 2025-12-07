"use client";

import React, { useState, useMemo } from "react";
import { formatCurrency } from "../../POS/utils/formatCurrency";

export default function BulkInventoryModal({
  isOpen,
  onClose,
  products = [],
  branches = [],
  selectedBranch,
  orgSlug,
  onSuccess,
}) {
  const [movementType, setMovementType] = useState("entrada");
  const [cart, setCart] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [qty, setQty] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const term = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.sku && p.sku.toLowerCase().includes(term))
    );
  }, [productSearch, products]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleAddToCart = () => {
    if (!selectedProductId) {
      alert("Seleccione un producto");
      return;
    }
    const numQty = Number(qty);
    if (!qty || isNaN(numQty) || numQty <= 0) {
      alert("Ingrese una cantidad válida mayor a 0");
      return;
    }
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = cart.findIndex((item) => item.productId === selectedProductId);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].qty += numQty;
      if (cost) newCart[existingIndex].cost = Number(cost);
      if (note) newCart[existingIndex].note = note;
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          productId: selectedProductId,
          productName: product.name,
          productSku: product.sku || "",
          qty: numQty,
          cost: cost ? Number(cost) : product.cost || 0,
          note: note || "",
        },
      ]);
    }
    setSelectedProductId("");
    setQty("");
    setCost("");
    setNote("");
    setProductSearch("");
  };

  const handleRemoveFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateQty = (index, newQty) => {
    const numQty = Number(newQty);
    if (isNaN(numQty) || numQty <= 0) return;
    const newCart = [...cart];
    newCart[index].qty = numQty;
    setCart(newCart);
  };

  const totals = useMemo(() => {
    return cart.reduce(
      (acc, item) => {
        acc.items += 1;
        acc.units += item.qty;
        acc.cost += item.qty * (item.cost || 0);
        return acc;
      },
      { items: 0, units: 0, cost: 0 }
    );
  }, [cart]);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Agregue al menos un producto al carrito");
      return;
    }
    if (!selectedBranch || selectedBranch === "all") {
      alert("Debe seleccionar una sucursal antes de registrar movimientos");
      return;
    }
    setSubmitting(true);
    setResults(null);
    const successItems = [];
    const failedItems = [];

    for (const item of cart) {
      try {
        const res = await fetch("/api/inventory/movements", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify({
            productId: item.productId,
            type: movementType,
            qty: item.qty,
            cost: item.cost,
            notes: item.note || `${movementType === "entrada" ? "Entrada" : movementType === "salida" ? "Salida" : "Ajuste"} múltiple desde Kardex`,
            branchId: selectedBranch,
          }),
        });
        if (res.ok) {
          successItems.push(item);
        } else {
          const err = await res.json().catch(() => ({}));
          failedItems.push({ ...item, error: err.error || "Error desconocido" });
        }
      } catch (err) {
        failedItems.push({ ...item, error: err.message });
      }
    }

    setResults({ success: successItems, failed: failedItems });
    setSubmitting(false);

    if (failedItems.length === 0) {
      setTimeout(() => {
        setCart([]);
        setResults(null);
        onSuccess?.();
        onClose();
      }, 1500);
    } else {
      setCart(failedItems.map(({ error, ...item }) => item));
    }
  };

  const handleClose = () => {
    setCart([]);
    setResults(null);
    setProductSearch("");
    setSelectedProductId("");
    setQty("");
    setCost("");
    setNote("");
    onClose();
  };

  if (!isOpen) return null;

  const branchName = branches.find((b) => b.id === selectedBranch)?.name || "Sin seleccionar";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Movimiento Múltiple de Inventario</h2>
              <p className="text-xs text-slate-500 mt-1">Sucursal: <span className="font-semibold text-slate-700">{branchName}</span></p>
            </div>
            <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setMovementType("entrada")} className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${movementType === "entrada" ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>+ Entrada</button>
            <button onClick={() => setMovementType("salida")} className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${movementType === "salida" ? "bg-red-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>- Salida</button>
            <button onClick={() => setMovementType("ajuste")} className={`px-4 py-2 text-xs rounded-lg font-semibold transition ${movementType === "ajuste" ? "bg-amber-600 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"}`}>Ajuste</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Agregar producto al carrito</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs text-slate-600 block mb-1">Producto</label>
                <input type="text" placeholder="Buscar producto..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} className="w-full p-2 text-xs border rounded-lg mb-1" />
                <select value={selectedProductId} onChange={(e) => { setSelectedProductId(e.target.value); const prod = products.find((p) => p.id === e.target.value); if (prod?.cost) setCost(String(prod.cost)); }} className="w-full p-2 text-xs border rounded-lg">
                  <option value="">Seleccionar producto...</option>
                  {filteredProducts.map((p) => (<option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ""}</option>))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 block mb-1">Cantidad</label>
                <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" min="1" className="w-full p-2 text-xs border rounded-lg mt-6" />
              </div>
              {movementType === "entrada" && (
                <div>
                  <label className="text-xs text-slate-600 block mb-1">Costo Unit.</label>
                  <input type="number" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="0.00" step="0.01" className="w-full p-2 text-xs border rounded-lg mt-6" />
                </div>
              )}
              <div className="flex items-end">
                <button onClick={handleAddToCart} disabled={!selectedProductId || !qty} className={`w-full p-2 text-xs rounded-lg font-semibold ${selectedProductId && qty ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>Agregar</button>
              </div>
            </div>
            <div className="mt-3">
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Nota opcional (ej: Compra proveedor X)" className="w-full p-2 text-xs border rounded-lg" />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="bg-slate-100 p-3 border-b">
              <h3 className="text-sm font-semibold text-slate-700">Carrito ({cart.length} productos, {totals.units} unidades)</h3>
            </div>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No hay productos en el carrito.</div>
            ) : (
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-center w-24">Cantidad</th>
                    {movementType === "entrada" && <th className="p-2 text-right w-24">Costo</th>}
                    {movementType === "entrada" && <th className="p-2 text-right w-24">Total</th>}
                    <th className="p-2 text-left">Nota</th>
                    <th className="p-2 text-center w-16">Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-slate-50">
                      <td className="p-2"><span className="font-medium">{item.productName}</span>{item.productSku && <span className="text-slate-400 ml-1">({item.productSku})</span>}</td>
                      <td className="p-2 text-center"><input type="number" value={item.qty} onChange={(e) => handleUpdateQty(index, e.target.value)} min="1" className="w-16 p-1 text-center border rounded text-xs" /></td>
                      {movementType === "entrada" && <td className="p-2 text-right">{formatCurrency(item.cost)}</td>}
                      {movementType === "entrada" && <td className="p-2 text-right font-medium">{formatCurrency(item.qty * item.cost)}</td>}
                      <td className="p-2 text-slate-500">{item.note || "-"}</td>
                      <td className="p-2 text-center"><button onClick={() => handleRemoveFromCart(index)} className="text-red-500 hover:text-red-700 font-bold">&times;</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {results && (
            <div className="mt-4 p-4 rounded-lg border">
              {results.success.length > 0 && <p className="text-green-600 text-sm mb-2">{results.success.length} movimiento(s) registrado(s) correctamente</p>}
              {results.failed.length > 0 && (
                <div className="text-red-600 text-sm">
                  <p className="font-semibold mb-1">{results.failed.length} movimiento(s) fallaron:</p>
                  <ul className="list-disc list-inside">{results.failed.map((item, i) => (<li key={i}>{item.productName}: {item.error}</li>))}</ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <span className="text-slate-600">Total: </span>
              <span className="font-bold text-slate-800">{totals.items} productos, {totals.units} unidades</span>
              {movementType === "entrada" && totals.cost > 0 && <span className="ml-2 text-emerald-600 font-semibold">({formatCurrency(totals.cost)})</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={handleClose} className="px-4 py-2 text-xs bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">Cancelar</button>
              <button onClick={handleSubmit} disabled={cart.length === 0 || submitting} className={`px-6 py-2 text-xs rounded-lg font-semibold ${cart.length > 0 && !submitting ? movementType === "entrada" ? "bg-emerald-600 text-white hover:bg-emerald-700" : movementType === "salida" ? "bg-red-600 text-white hover:bg-red-700" : "bg-amber-600 text-white hover:bg-amber-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}>
                {submitting ? "Procesando..." : `Confirmar ${movementType === "entrada" ? "Entradas" : movementType === "salida" ? "Salidas" : "Ajustes"}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}