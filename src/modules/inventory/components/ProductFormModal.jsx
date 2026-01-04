"use client";

import React, { useEffect, useState } from "react";

const DEFAULT_SUBCATEGORIES = [
  "BROILER",
  "CABALLO",
  "CRIOLLO",
  "PERRO",
  "PERRO DOGUI",
  "PERRO DOGUI CACHO",
  "PERRO GATO",
  "PERRO PET",
  "PONEDORAS",
  "PORCICULTURA",
  "FERRETERIA",
  "VETERINARIA",
  "PET ACCESORIES",
];

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
    productId: null,
    name: "",
    sku: "",
    category: "",
    subcategory: "",
    branch: "",
    branchId: "",
    unitWeight: 0,
    minStock: 0,
    cost: 0,
    price: 0,
    unit: "LB",
    expiresAt: "",
  });

  useEffect(() => {
    if (!isOpen) return;

    const defaultBranch = branches[0];
    setForm({
      id: product?.id ?? null,
      productId: product?.productId ?? null,
      name: product?.name ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? categories[0] ?? "",
      subcategory: product?.subcategory ?? "",
      branch: product?.branch ?? defaultBranch?.name ?? "",
      branchId: product?.branchId ?? defaultBranch?.id ?? "",
      unitWeight: product?.unitWeight ?? 0,
      minStock: product?.minStock ?? 0,
      cost: product?.cost ?? 0,
      price: product?.price ?? 0,
      unit: product?.unit ?? "LB",
      expiresAt: product?.expiresAt ?? "",
    });
  }, [isOpen, product, branches, categories]);

  if (!isOpen) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    const numeric = ["unitWeight", "minStock", "cost", "price"];

    setForm((prev) => ({
      ...prev,
      [name]: numeric.includes(name) ? Number(value) : value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const { toast } = require("@/src/lib/notifications/toast");
    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    if (!form.sku.trim()) {
      toast.error("El código es obligatorio");
      return;
    }
    onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-6 max-h-[90vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre">
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-soft"
              placeholder="Ej: Engordina 100 lb"
            />
          </Field>

          <Field label="Código / SKU">
            <input
              name="sku"
              value={form.sku}
              onChange={handleChange}
              className="input-soft"
              placeholder="Ej: ENG-100"
            />
          </Field>

          <Field label="Fecha de vencimiento">
            <input
              type="date"
              name="expiresAt"
              value={form.expiresAt}
              onChange={handleChange}
              className="input-soft"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
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

            <Field label="Tipo Animal">
              <select
                name="subcategory"
                value={form.subcategory}
                onChange={handleChange}
                className="input-soft"
              >
                <option value="">Sin subcategoría</option>
                {DEFAULT_SUBCATEGORIES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Bodega">
              <select
                name="branch"
                value={form.branchId}
                onChange={(e) => {
                  const selectedBranch = branches.find(b => b.id === e.target.value);
                  setForm(prev => ({
                    ...prev,
                    branch: selectedBranch?.name || "",
                    branchId: e.target.value,
                  }));
                }}
                className="input-soft"
              >
                <option value="">Seleccionar...</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
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

          <div className="grid grid-cols-4 gap-3">
            <NumberField label="Peso (lb/kg)" name="unitWeight" value={form.unitWeight} onChange={handleChange} />
            <NumberField label="Stock Min" name="minStock" value={form.minStock} onChange={handleChange} />
            <NumberField label="Costo" name="cost" value={form.cost} onChange={handleChange} />
            <NumberField label="Precio" name="price" value={form.price} onChange={handleChange} />
          </div>

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
      <input type="number" {...props} className="input-soft" />
    </Field>
  );
}
