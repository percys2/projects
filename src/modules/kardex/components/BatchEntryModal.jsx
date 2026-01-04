"use client";

import React, { useState, useEffect } from "react";

export default function BatchEntryModal({
  isOpen,
  onClose,
  onSubmit,
  products,
  branches,
  type = "entrada",
  orgSlug,
}) {
  const [items, setItems] = useState([{ productId: "", qty: "", cost: "", unit: "UND", productName: "" }]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [providerName, setProviderName] = useState("");
  const [providerInvoice, setProviderInvoice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerms, setSearchTerms] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showPasteMode, setShowPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pastePreview, setPastePreview] = useState([]);
  const [pasteErrors, setPasteErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setItems([{ productId: "", qty: "", cost: "", unit: "UND", productName: "" }]);
      setSelectedBranch("");
      setProviderName("");
      setProviderInvoice("");
      setNotes("");
      setSearchTerms({});
      setActiveDropdown(null);
      setShowPasteMode(false);
      setPasteText("");
      setPastePreview([]);
      setPasteErrors([]);
    }
  }, [isOpen]);

  const addItem = () => {
    setItems([...items, { productId: "", qty: "", cost: "", unit: "UND", productName: "" }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index, field, value, productName = null) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === "productId" && value) {
      const product = products.find((p) => p.id === value);
      if (product?.unit) {
        newItems[index].unit = product.unit;
      }
      if (productName) {
        newItems[index].productName = productName;
      }
    }
    
    setItems(newItems);
  };

  const getTypeLabel = () => {
    const labels = {
      entrada: "Entrada Masiva",
      salida: "Salida Masiva",
      ajuste: "Ajuste Masivo",
      transferencia: "Transferencia Masiva",
    };
    return labels[type] || "Movimiento Masivo";
  };

  const getTypeColor = () => {
    const colors = {
      entrada: "bg-emerald-600 hover:bg-emerald-700",
      salida: "bg-red-600 hover:bg-red-700",
      ajuste: "bg-amber-600 hover:bg-amber-700",
      transferencia: "bg-blue-600 hover:bg-blue-700",
    };
    return colors[type] || "bg-slate-600 hover:bg-slate-700";
  };

  const handleSubmit = async () => {
    const validItems = items.filter((item) => item.productId && item.qty > 0);
    if (validItems.length === 0) {
      alert("Agregue al menos un producto con cantidad");
      return;
    }

    if (!selectedBranch) {
      alert("Seleccione una bodega/sucursal");
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        type,
        branchId: selectedBranch,
        items: validItems.map((item) => ({
          productId: item.productId,
          qty: Number(item.qty),
          cost: item.cost ? Number(item.cost) : null,
        })),
        providerName,
        providerInvoice,
        notes,
      });
    } catch (err) {
      alert(err.message || "Error al procesar");
    }

    setLoading(false);
  };

  const getFilteredProducts = (index) => {
    const term = searchTerms[index]?.toLowerCase() || "";
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term)
    );
  };

  const findProductByNameOrSku = (searchText) => {
    if (!searchText) return null;
    const term = searchText.toString().toLowerCase().trim();
  
    let found = products.find((p) => p.sku?.toLowerCase() === term);
    if (found) return found;
  
    found = products.find((p) => p.name?.toLowerCase() === term);
    if (found) return found;
  
    found = products.find((p) => p.name?.toLowerCase().includes(term));
    if (found) return found;
  
    const cleanTerm = term.replace(/\s+(pl|cr|kg|lbrs|100l|25kg|und|unidad)$/i, "").trim();
    found = products.find((p) => p.name?.toLowerCase().includes(cleanTerm));
  
    return found;
  };

  const parsePastedData = (text) => {
    const lines = text.trim().split("\n").filter(line => line.trim());
    const parsed = [];
    const errors = [];
  
    lines.forEach((line, idx) => {
      const parts = line.split(/\t|,|(?:\s{2,})/).map(p => p.trim()).filter(p => p);
    
      if (parts.length < 2) {
        errors.push(`Linea ${idx + 1}: Formato invalido (necesita al menos nombre y cantidad)`);
        return;
      }
    
      let productSearch = "";
      let qty = 0;
      let cost = null;
    
      const firstIsNumber = !isNaN(parseFloat(parts[0])) && parts[0].match(/^\d+(\.\d+)?$/);
    
      if (parts.length === 2) {
        if (firstIsNumber && !isNaN(parseFloat(parts[1]))) {
          productSearch = parts[0];
          qty = parseFloat(parts[1]);
        } else if (firstIsNumber) {
          qty = parseFloat(parts[0]);
          productSearch = parts[1];
        } else {
          productSearch = parts[0];
          qty = parseFloat(parts[1]) || 0;
        }
      } else if (parts.length === 3) {
        productSearch = parts[0];
        qty = parseFloat(parts[1]) || 0;
        cost = parseFloat(parts[2]) || null;
      } else if (parts.length >= 4) {
        productSearch = parts[1] || parts[0];
        qty = parseFloat(parts[2]) || 0;
        cost = parseFloat(parts[3]) || null;
      }
    
      const product = findProductByNameOrSku(productSearch);
    
      if (!product) {
        errors.push(`Linea ${idx + 1}: No se encontro "${productSearch}"`);
        parsed.push({
          lineNum: idx + 1,
          original: line,
          productSearch,
          qty,
          cost,
          product: null,
          matched: false,
        });
      } else {
        parsed.push({
          lineNum: idx + 1,
          original: line,
          productSearch,
          qty,
          cost,
          product,
          matched: true,
        });
      }
    });
  
    return { parsed, errors };
  };

  const handlePasteAnalyze = () => {
    const { parsed, errors } = parsePastedData(pasteText);
    setPastePreview(parsed);
    setPasteErrors(errors);
  };

  const handleApplyPaste = () => {
    const matchedItems = pastePreview.filter(p => p.matched);
    if (matchedItems.length === 0) {
      alert("No hay productos validos para importar");
      return;
    }
  
    const newItems = matchedItems.map(p => ({
      productId: p.product.id,
      productName: p.product.name,
      qty: p.qty.toString(),
      cost: p.cost?.toString() || "",
      unit: p.product.unit || "UND",
    }));
  
    setItems(newItems);
    setShowPasteMode(false);
    setPasteText("");
    setPastePreview([]);
    setPasteErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className={`${getTypeColor().split(" ")[0]} text-white p-4`}>
          <h2 className="text-lg font-bold">{getTypeLabel()}</h2>
          <p className="text-sm opacity-80">Agregue multiples productos en una sola operacion</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Bodega/Sucursal *
              </label>
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

            {type === "entrada" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    Proveedor
                  </label>
                  <input
                    type="text"
                    value={providerName}
                    onChange={(e) => setProviderName(e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full p-2 text-sm border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">
                    # Factura Proveedor
                  </label>
                  <input
                    type="text"
                    value={providerInvoice}
                    onChange={(e) => setProviderInvoice(e.target.value)}
                    placeholder="Numero de factura"
                    className="w-full p-2 text-sm border rounded-lg"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Notas / Observaciones
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas adicionales..."
              className="w-full p-2 text-sm border rounded-lg"
            />
          </div>

          <div className="flex gap-2 mb-2">
            <button
              onClick={() => setShowPasteMode(false)}
              className={`px-3 py-1.5 text-xs rounded-lg ${!showPasteMode ? "bg-slate-700 text-white" : "bg-slate-200 text-slate-600"}`}
            >
              Agregar Manual
            </button>
            <button
              onClick={() => setShowPasteMode(true)}
              className={`px-3 py-1.5 text-xs rounded-lg ${showPasteMode ? "bg-blue-600 text-white" : "bg-blue-100 text-blue-700"}`}
            >
              Pegar desde Excel
            </button>
          </div>

          {showPasteMode ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">
                  Pega aqui los datos de Excel (Nombre, Cantidad, Costo)
                </label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={"Ejemplo:\nENGORDINA PL\t51\t1184\nINICIARINA CR\t12\t1213\nNOVA GALLOS PLUS\t6\t1204"}
                  rows={8}
                  className="w-full p-2 text-xs border rounded-lg font-mono"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Formato: Nombre TAB Cantidad TAB Costo (o separado por comas)
                </p>
              </div>
    
              <button
                onClick={handlePasteAnalyze}
                disabled={!pasteText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Analizar Datos
              </button>

              {pastePreview.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-slate-100 p-2 text-xs font-semibold flex justify-between">
                    <span>Vista Previa ({pastePreview.filter(p => p.matched).length} encontrados, {pastePreview.filter(p => !p.matched).length} no encontrados)</span>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="text-left p-2">Estado</th>
                          <th className="text-left p-2">Buscado</th>
                          <th className="text-left p-2">Producto Encontrado</th>
                          <th className="text-center p-2">Cant</th>
                          <th className="text-center p-2">Costo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pastePreview.map((item, idx) => (
                          <tr key={idx} className={item.matched ? "bg-green-50" : "bg-red-50"}>
                            <td className="p-2">
                              {item.matched ? (
                                <span className="text-green-600 font-bold">OK</span>
                              ) : (
                                <span className="text-red-600 font-bold">X</span>
                              )}
                            </td>
                            <td className="p-2 text-slate-600">{item.productSearch}</td>
                            <td className="p-2 font-medium">{item.product?.name || "-"}</td>
                            <td className="p-2 text-center">{item.qty}</td>
                            <td className="p-2 text-center">{item.cost || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
        
                  {pasteErrors.length > 0 && (
                    <div className="bg-red-50 p-2 text-xs text-red-700 border-t">
                      <strong>Errores:</strong>
                      <ul className="list-disc ml-4">
                        {pasteErrors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {pasteErrors.length > 5 && <li>...y {pasteErrors.length - 5} mas</li>}
                      </ul>
                    </div>
                  )}
        
                  <div className="p-2 bg-slate-50 border-t">
                    <button
                      onClick={handleApplyPaste}
                      disabled={pastePreview.filter(p => p.matched).length === 0}
                      className="w-full py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
                    >
                      Aplicar {pastePreview.filter(p => p.matched).length} productos encontrados
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-visible">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-2 font-semibold text-slate-600">Producto</th>
                      <th className="text-center p-2 font-semibold text-slate-600 w-24">Cantidad</th>
                      {type === "entrada" && (
                        <th className="text-center p-2 font-semibold text-slate-600 w-28">Costo</th>
                      )}
                      <th className="text-center p-2 font-semibold text-slate-600 w-20">UM</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Buscar producto..."
                              value={activeDropdown === index ? (searchTerms[index] || "") : (item.productName || "")}
                              onChange={(e) => {
                                setSearchTerms({ ...searchTerms, [index]: e.target.value });
                                setActiveDropdown(index);
                              }}
                              onFocus={() => {
                                setActiveDropdown(index);
                                if (item.productName) {
                                  setSearchTerms({ ...searchTerms, [index]: item.productName });
                                }
                              }}
                              onBlur={() => {
                                setTimeout(() => setActiveDropdown(null), 200);
                              }}
                              className="w-full p-2 text-sm border rounded-lg"
                            />
                            {activeDropdown === index && searchTerms[index] && (
                              <div className="absolute top-full left-0 right-0 bg-white border rounded-b-lg shadow-xl z-[100] max-h-40 overflow-y-auto">
                                {getFilteredProducts(index).slice(0, 10).map((p) => (
                                  <div
                                    key={p.id}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      updateItem(index, "productId", p.id, p.name);
                                      setSearchTerms({ ...searchTerms, [index]: "" });
                                      setActiveDropdown(null);
                                    }}
                                    className="p-2 hover:bg-blue-50 cursor-pointer text-xs"
                                  >
                                    <span className="font-medium">{p.name}</span>
                                    {p.sku && <span className="text-slate-400 ml-2">({p.sku})</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateItem(index, "qty", e.target.value)}
                            placeholder="0"
                            min="1"
                            className="w-full p-2 text-sm border rounded-lg text-center"
                          />
                        </td>
                        {type === "entrada" && (
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.cost}
                              onChange={(e) => updateItem(index, "cost", e.target.value)}
                              placeholder="0.00"
                              step="0.01"
                              className="w-full p-2 text-sm border rounded-lg text-center"
                            />
                          </td>
                        )}
                        <td className="p-2 text-center text-slate-500">
                          {item.unit || "UND"}
                        </td>
                        <td className="p-2">
                          <button
                            onClick={() => removeItem(index)}
                            disabled={items.length === 1}
                            className="text-red-500 hover:text-red-700 disabled:text-slate-300 p-1"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                onClick={addItem}
                className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:border-slate-400 hover:text-slate-600 text-sm"
              >
                + Agregar otro producto
              </button>
            </>
          )}

          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total de productos:</span>
              <span className="font-bold">{items.filter((i) => i.productId).length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Total de unidades:</span>
              <span className="font-bold">
                {items.reduce((acc, i) => acc + (Number(i.qty) || 0), 0)}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t p-4 flex gap-3 justify-end bg-slate-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2 ${getTypeColor()} text-white rounded-lg text-sm font-medium disabled:opacity-50`}
          >
            {loading ? "Procesando..." : `Confirmar ${getTypeLabel()}`}
          </button>
        </div>
      </div>
    </div>
  );
}