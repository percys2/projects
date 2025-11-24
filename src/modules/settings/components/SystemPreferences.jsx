import React, { useState, useEffect } from "react";

export default function SystemPreferences({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    currency: "NIO",
    timezone: "America/Managua",
    language: "es",
    date_format: "DD/MM/YYYY",
    decimal_separator: ",",
    thousand_separator: ".",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        currency: settings.currency || "NIO",
        timezone: settings.timezone || "America/Managua",
        language: settings.language || "es",
        date_format: settings.date_format || "DD/MM/YYYY",
        decimal_separator: settings.decimal_separator || ",",
        thousand_separator: settings.thousand_separator || ".",
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold mb-4">Preferencias del Sistema</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Moneda</label>
          <select
            value={formData.currency}
            onChange={(e) => handleChange("currency", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="NIO">Córdoba (C$)</option>
            <option value="USD">Dólar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zona Horaria</label>
          <select
            value={formData.timezone}
            onChange={(e) => handleChange("timezone", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="America/Managua">América/Managua (GMT-6)</option>
            <option value="America/Mexico_City">América/Ciudad de México (GMT-6)</option>
            <option value="America/New_York">América/Nueva York (GMT-5)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Idioma</label>
          <select
            value={formData.language}
            onChange={(e) => handleChange("language", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Formato de Fecha</label>
          <select
            value={formData.date_format}
            onChange={(e) => handleChange("date_format", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Separador Decimal</label>
            <select
              value={formData.decimal_separator}
              onChange={(e) => handleChange("decimal_separator", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value=",">, (coma)</option>
              <option value=".">. (punto)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Separador de Miles</label>
            <select
              value={formData.thousand_separator}
              onChange={(e) => handleChange("thousand_separator", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value=".">. (punto)</option>
              <option value=",">, (coma)</option>
              <option value=" "> (espacio)</option>
            </select>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
}
