import React, { useState, useEffect } from "react";

export default function OrganizationSettings({ settings, onUpdate }) {
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_slug: "",
    address: "",
    phone: "",
    email: "",
    tax_id: "",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        organization_name: settings.organization_name || "",
        organization_slug: settings.organization_slug || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
        tax_id: settings.tax_id || "",
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
      <h3 className="text-lg font-semibold mb-4">Información de la Organización</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la Organización</label>
          <input
            type="text"
            value={formData.organization_name}
            onChange={(e) => handleChange("organization_name", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="AgroCentro S.A."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input
            type="text"
            value={formData.organization_slug}
            onChange={(e) => handleChange("organization_slug", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-slate-50"
            placeholder="agrocentro"
            disabled
          />
          <p className="text-xs text-slate-500 mt-1">El slug no se puede cambiar después de creado</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Dirección</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Managua, Nicaragua"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="2222-2222"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
              placeholder="info@agrocentro.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">RUC / Número de Identificación Fiscal</label>
          <input
            type="text"
            value={formData.tax_id}
            onChange={(e) => handleChange("tax_id", e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="J0310000000000"
          />
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
