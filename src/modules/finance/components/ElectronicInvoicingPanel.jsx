"use client";

import { useState } from "react";
import { FileCheck, AlertCircle, Settings, Send, RefreshCw } from "lucide-react";

export default function ElectronicInvoicingPanel({ orgSlug }) {
  const [config, setConfig] = useState({
    ruc: "",
    dgiUser: "",
    dgiPassword: "",
    environment: "test",
    enabled: false,
  });
  const [saving, setSaving] = useState(false);

  // Mock recent invoices for demo
  const [recentInvoices] = useState([
    { id: 1, number: "FAC-001", client: "Cliente Demo", total: 5000, dgiStatus: "pending", date: "2025-12-01" },
    { id: 2, number: "FAC-002", client: "Otro Cliente", total: 12500, dgiStatus: "sent", date: "2025-12-03" },
    { id: 3, number: "FAC-003", client: "Empresa XYZ", total: 8750, dgiStatus: "error", date: "2025-12-05" },
  ]);

  const handleSaveConfig = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    alert("Configuración guardada (stub - requiere integración real con DGI)");
    setSaving(false);
  };

  const handleSendToDgi = async (invoiceId) => {
    alert(`Enviando factura ${invoiceId} a DGI... (stub - requiere integración real)`);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "sent":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Enviada</span>;
      case "error":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Error</span>;
      case "pending":
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Pendiente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <FileCheck className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">Facturación Electrónica (DGI Nicaragua)</h3>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">Integración en Desarrollo</p>
            <p className="text-xs text-yellow-700 mt-1">
              Esta funcionalidad requiere integración con el sistema de la DGI de Nicaragua. 
              Los campos y acciones mostrados son preparatorios. Contacte a su proveedor de 
              software para completar la integración con las APIs oficiales de la DGI.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Section */}
      <div className="bg-slate-50 rounded-lg p-4 border">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="text-sm font-medium text-slate-700">Configuración DGI</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">RUC de la Empresa</label>
            <input
              type="text"
              value={config.ruc}
              onChange={(e) => setConfig({ ...config, ruc: e.target.value })}
              placeholder="000-000000-0000X"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Usuario DGI</label>
            <input
              type="text"
              value={config.dgiUser}
              onChange={(e) => setConfig({ ...config, dgiUser: e.target.value })}
              placeholder="Usuario de acceso"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Contraseña DGI</label>
            <input
              type="password"
              value={config.dgiPassword}
              onChange={(e) => setConfig({ ...config, dgiPassword: e.target.value })}
              placeholder="--------"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Ambiente</label>
            <select
              value={config.environment}
              onChange={(e) => setConfig({ ...config, environment: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="test">Pruebas (Sandbox)</option>
              <option value="production">Producción</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            id="dgi-enabled"
            checked={config.enabled}
            onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="dgi-enabled" className="text-sm text-slate-600">
            Habilitar facturación electrónica
          </label>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={saving}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>

      {/* Recent Invoices */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b">
          <span className="text-sm font-medium text-slate-700">Facturas Recientes</span>
        </div>
        
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left">Número</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Fecha</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Estado DGI</th>
              <th className="px-4 py-2 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {recentInvoices.map((inv) => (
              <tr key={inv.id} className="border-b hover:bg-slate-50">
                <td className="px-4 py-2 font-medium">{inv.number}</td>
                <td className="px-4 py-2">{inv.client}</td>
                <td className="px-4 py-2 text-slate-500">{inv.date}</td>
                <td className="px-4 py-2 text-right">C$ {inv.total.toLocaleString("es-NI")}</td>
                <td className="px-4 py-2 text-center">{getStatusBadge(inv.dgiStatus)}</td>
                <td className="px-4 py-2 text-center">
                  {inv.dgiStatus !== "sent" && (
                    <button
                      onClick={() => handleSendToDgi(inv.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      <Send className="w-3 h-3" />
                      Enviar
                    </button>
                  )}
                  {inv.dgiStatus === "error" && (
                    <button
                      onClick={() => handleSendToDgi(inv.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 ml-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reintentar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500 italic">
        Para completar la integración con la DGI, se requiere: certificado digital, 
        documentación oficial de la API de la DGI, y configuración de endpoints de producción.
      </p>
    </div>
  );
}