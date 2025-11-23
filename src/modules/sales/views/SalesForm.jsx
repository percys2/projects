"use client";

import { useState, useEffect } from "react";
import { calculateMargin } from "../utils/calculateMargin";
import { products } from "@/src/data/products";

export default function SalesForm({ onSave }) {
  const [form, setForm] = useState({
    clasificacion: "",
    linea: "",
    factura: "",
    nombre: "",
    fecha: "",
    descripcion: "",
    cantidad: 1,
    subtotal: 0,
    descuento: 0,
    iva: 0,
    venta_credito: 0,
    venta_contado: 0,
    costo_unit: 0,
    costo_venta: 0,
    margen: 0,
    porcentaje: 0,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);

  // 🔵 Cuando seleccionas un producto → carga el costo automáticamente
  function handleSelectProduct(productName) {
    const p = products.find((x) => x.name === productName);
    setSelectedProduct(p);

    if (p) {
      setForm((f) => ({
        ...f,
        descripcion: p.name,
        costo_unit: p.cost,
      }));
    }
  }

  // 🔵 Calcula costo_venta + margen + porcentaje automáticamente
  useEffect(() => {
    const costo_venta = form.cantidad * form.costo_unit;
    const { margen, porcentaje } = calculateMargin(form.subtotal, costo_venta);

    setForm((f) => ({
      ...f,
      costo_venta,
      margen,
      porcentaje,
    }));
  }, [form.cantidad, form.costo_unit, form.subtotal]);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form); // 🔥 envía toda la venta al módulo que la guarde
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registrar Venta Manual</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">

        {/* CLASIFICACIÓN */}
        <input
          type="text"
          placeholder="Clasificación"
          className="border p-2 rounded"
          value={form.clasificacion}
          onChange={(e) => updateField("clasificacion", e.target.value)}
        />

        {/* LÍNEA */}
        <input
          type="text"
          placeholder="Línea"
          className="border p-2 rounded"
          value={form.linea}
          onChange={(e) => updateField("linea", e.target.value)}
        />

        {/* FACTURA */}
        <input
          type="text"
          placeholder="Número de Factura"
          className="border p-2 rounded"
          value={form.factura}
          onChange={(e) => updateField("factura", e.target.value)}
        />

        {/* CLIENTE */}
        <input
          type="text"
          placeholder="Nombre del Cliente"
          className="border p-2 rounded"
          value={form.nombre}
          onChange={(e) => updateField("nombre", e.target.value)}
        />

        {/* FECHA */}
        <input
          type="date"
          className="border p-2 rounded"
          value={form.fecha}
          onChange={(e) => updateField("fecha", e.target.value)}
        />

        {/* PRODUCTO */}
        <select
          className="border p-2 rounded"
          onChange={(e) => handleSelectProduct(e.target.value)}
        >
          <option value="">Selecciona un producto...</option>

          {products.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>

        {/* CANTIDAD */}
        <input
          type="number"
          min="1"
          className="border p-2 rounded"
          value={form.cantidad}
          onChange={(e) => updateField("cantidad", Number(e.target.value))}
        />

        {/* SUBTOTAL */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Subtotal"
          value={form.subtotal}
          onChange={(e) => updateField("subtotal", Number(e.target.value))}
        />

        {/* DESCUENTO */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="Descuento"
          value={form.descuento}
          onChange={(e) => updateField("descuento", Number(e.target.value))}
        />

        {/* IVA */}
        <input
          type="number"
          className="border p-2 rounded"
          placeholder="IVA"
          value={form.iva}
          onChange={(e) => updateField("iva", Number(e.target.value))}
        />

        {/* CAMPOS AUTOMÁTICOS */}
        <div className="col-span-2 bg-slate-100 p-4 rounded">
          <p>Costo Unitario: <b>C$ {form.costo_unit}</b></p>
          <p>Costo Venta: <b>C$ {form.costo_venta}</b></p>
          <p>Margen: <b>C$ {form.margen}</b></p>
          <p>Porcentaje: <b>{(form.porcentaje * 100).toFixed(2)}%</b></p>
        </div>

        <button
          type="submit"
          className="col-span-2 bg-black text-white py-2 rounded"
        >
          Guardar Venta
        </button>
      </form>
    </div>
  );
}
