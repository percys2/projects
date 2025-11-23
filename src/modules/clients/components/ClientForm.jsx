"use client";

import { useState } from "react";
import { useClientStore } from "../store/useClientStore";
import { usePipelineStore } from "../store/usePipelineStore";

export default function ClientForm({ onClose }) {
  const addClient = useClientStore((s) => s.addClient);
  const updateStats = usePipelineStore((s) => s.updateStats);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    department: "",
    municipality: "",
    address: "",
    type: "",
    pipeline: "lead",
    notes: "",
    gps: "",
    // productivos
    cerdo_cerdas: "",
    cerdo_lechones: "",
    cerdo_engorde: "",
    pollo_lote: "",
    pollo_mensual: "",
    ganado_vacas: "",
    ganado_leche: "",
    revendedor_volumen: "",
    marca_actual: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = () => {
    if (!form.name || !form.phone) {
      alert("Nombre y teléfono son obligatorios.");
      return;
    }

    addClient(form);
    updateStats(form.pipeline);

    if (onClose) onClose();
  };

  const whatsappMessage = encodeURIComponent(
    `Hola ${form.name}, gracias por registrarte con AgroCentro Nica. Estamos para servirte.`
  );

  const sendWhatsapp = () => {
    window.open(`https://wa.me/505${form.phone}?text=${whatsappMessage}`);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg space-y-4">

      {/* HEADER */}
      <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
        Crear Nuevo Cliente
      </h2>

      {/* NOMBRE */}
      <div>
        <label className="text-sm font-semibold">Nombre / Negocio</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
          placeholder="Ej: Don Julio, Granja El Porvenir"
        />
      </div>

      {/* WHATSAPP */}
      <div>
        <label className="text-sm font-semibold">Teléfono (WhatsApp)</label>
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
          placeholder="Ej: 88887777"
        />
      </div>

      {/* UBICACIÓN */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold">Departamento</label>
          <input
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg"
            placeholder="Masaya, Granada, Managua…"
          />
        </div>

        <div>
          <label className="text-sm font-semibold">Municipio</label>
          <input
            name="municipality"
            value={form.municipality}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg"
            placeholder="Masatepe, Diriomo…"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold">Dirección</label>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
          placeholder="Casa esquinera, del parque 2 cuadras al sur..."
        />
      </div>

      {/* TIPO DE CLIENTE */}
      <div>
        <label className="text-sm font-semibold">Tipo de Cliente</label>
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          <option value="">Seleccione</option>
          <option value="cerdos">Productor de Cerdos</option>
          <option value="pollos">Productor de Pollos</option>
          <option value="ganado">Ganadero</option>
          <option value="revendedor">Revendedor</option>
          <option value="gallos">Criador de Gallos</option>
          <option value="negocio">Negocio / Pulpería</option>
          <option value="final">Consumidor Final</option>
        </select>
      </div>

      {/* FORMULARIOS DINÁMICOS */}
      {form.type === "cerdos" && (
        <div className="border p-3 rounded-lg bg-slate-50">
          <h3 className="font-semibold mb-2">🐷 Datos del Productor Porcino</h3>
          <div className="grid grid-cols-3 gap-3">
            <input
              name="cerdo_cerdas"
              placeholder="Cerdas en producción"
              value={form.cerdo_cerdas}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
            <input
              name="cerdo_lechones"
              placeholder="Lechones por mes"
              value={form.cerdo_lechones}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
            <input
              name="cerdo_engorde"
              placeholder="Cerdos en engorde"
              value={form.cerdo_engorde}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {form.type === "pollos" && (
        <div className="border p-3 rounded-lg bg-slate-50">
          <h3 className="font-semibold mb-2">🐔 Datos del Productor Avícola</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="pollo_lote"
              placeholder="Cantidad por lote"
              value={form.pollo_lote}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
            <input
              name="pollo_mensual"
              placeholder="Lotes por mes"
              value={form.pollo_mensual}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {form.type === "ganado" && (
        <div className="border p-3 rounded-lg bg-slate-50">
          <h3 className="font-semibold mb-2">🐄 Datos del Ganadero</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              name="ganado_vacas"
              placeholder="Total de vacas"
              value={form.ganado_vacas}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
            <input
              name="ganado_leche"
              placeholder="Producción leche (L/día)"
              value={form.ganado_leche}
              onChange={handleChange}
              className="p-2 border rounded-lg"
            />
          </div>
        </div>
      )}

      {form.type === "revendedor" && (
        <div className="border p-3 rounded-lg bg-slate-50">
          <h3 className="font-semibold mb-2">🛒 Datos del Revendedor</h3>
          <input
            name="revendedor_volumen"
            placeholder="Volumen mensual (sacos)"
            value={form.revendedor_volumen}
            onChange={handleChange}
            className="p-2 border rounded-lg w-full"
          />
        </div>
      )}

      {/* PIPELINE */}
      <div>
        <label className="text-sm font-semibold">Estado en el Ciclo de Ventas</label>
        <select
          name="pipeline"
          value={form.pipeline}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
        >
          <option value="lead">Lead</option>
          <option value="prospecto">Prospecto</option>
          <option value="activo">Cliente Activo</option>
          <option value="frecuente">Cliente Frecuente</option>
          <option value="alto">Cliente de Alto Valor</option>
          <option value="inactivo">Cliente Inactivo</option>
        </select>
      </div>

      {/* NOTAS */}
      <div>
        <label className="text-sm font-semibold">Notas Comerciales</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="w-full mt-1 p-2 border rounded-lg"
          placeholder="Comentarios importantes, competencia, necesidades, etc."
        />
      </div>

      {/* BOTONES */}
      <div className="flex justify-between pt-3">
        <button
          onClick={sendWhatsapp}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Enviar WhatsApp
        </button>

        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Guardar Cliente
        </button>
      </div>
    </div>
  );
}
