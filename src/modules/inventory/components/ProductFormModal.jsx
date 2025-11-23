"use client";

import React, { useEffect, useState } from "react";

export default function ProductFormModal({
  isOpen,
  onClose,
  onSave,
  product,
  categories = [],
  branches = [],
}) {
  const [form, setForm] = useState({
    id: null,
    name: "",
    sku: "",
    category: "",
    branch: "",
    stock: 0,
    minStock: 0,
    cost: 0,
    price: 0,
    unit: "LB",
    expiresAt: "",
  });

  useEffect(() => {
    setForm({
      id: product?.id ?? null,
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? categories[0] ?? "",
      branch: product?.branch ?? branches[0] ?? "",
      stock: product?.stock ?? 0,
      minStock: product?.minStock ?? 0,
      cost: product?.cost ?? 0,
      price: product?.price ?? 0,
      unit: product?.unit ?? "LB",
      expiresAt: product?.expiresAt ?? "",
    });
  }, [product, categories, branches]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    const numeric = ["stock", "minStock", "cost", "price"];

    setForm((prev) => ({
      ...prev,
      [name]: numeric.includes(name) ? Number(value) : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("El nombre es obligatorio");
    if (!form.sku.trim()) return alert("El código es obligatorio");
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Cerrar
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <Field label="Nombre">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-soft"
              placeholder="Ej: Engordina 100 lb"
            />
          </Field>

          {/* SKU */}
          <Field label="Código / SKU">
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="input-soft"
              placeholder="Ej: ENG-100"
            />
          </Field>

          {/* Fechas */}
          <Field label="Fecha de vencimiento">
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="input-soft"
            />
          </Field>

          {/* CAT + BRANCH + UNIT */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Categoría">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-soft"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Bodega">
              <select
                name="branch"
                value={form.branch}
                onChange={handleChange}
                className="input-soft"
              >
                {branches.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </Field>

            <Field label="Unidad">
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="input-soft"
              >
                <option value="LB">LB</option>
                <option value="KG">KG</option>
                <option value="UND">UND</option>
              </select>
            </Field>
          </div>

          {/* NUMBERS */}
          <div className="grid grid-cols-4 gap-3">
            <NumberField label="Stock" name="stock" value={form.stock} onChange={handleChange} />
            <NumberField label="Min" name="minStock" value={form.minStock} onChange={handleChange} />
            <NumberField label="Costo" name="cost" value={form.cost} onChange={handleChange} />
            <NumberField label="Precio" name="price" value={form.price} onChange={handleChange} />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs bg-slate-200 rounded-lg hover:bg-slate-300"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* HELPERS */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function NumberField(props) {
  return (
    <Field label={props.label}>
      <input
        type="number"
        {...props}
        className="input-soft"
      />
    </Field>
  );
}
