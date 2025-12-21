"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvoiceSettings } from "../hooks/useInvoiceSettings";

export default function InvoicingTab({ orgSlug }) {
  const { invoiceSettings, setInvoiceSettings, loading, saving, loadInvoiceSettings, saveInvoiceSettings } = useInvoiceSettings(orgSlug);

  useEffect(() => {
    loadInvoiceSettings();
  }, [loadInvoiceSettings]);

  const handleSave = async () => {
    const result = await saveInvoiceSettings(invoiceSettings);
    if (result.success) {
      alert("Configuracion de facturacion guardada");
    } else {
      alert("Error: " + result.error);
    }
  };

  if (loading) {
    return (<Card><CardContent className="p-6"><p className="text-slate-500">Cargando configuracion...</p></CardContent></Card>);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Configuracion de Facturacion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label>Prefijo de factura</Label>
            <Input placeholder="FAC" value={invoiceSettings.prefix} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })} />
            <p className="text-xs text-slate-500">Ej: FAC, INV, FACT</p>
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Proximo numero</Label>
            <Input type="number" min="1" value={invoiceSettings.next_number} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, next_number: parseInt(e.target.value) || 1 })} />
            <p className="text-xs text-slate-500">Numero consecutivo actual</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-slate-800 mb-4">Configuracion de Impuestos</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              <Label>Nombre del impuesto</Label>
              <Input placeholder="IVA" value={invoiceSettings.tax_name} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tax_name: e.target.value })} />
            </div>
            <div className="flex flex-col space-y-2">
              <Label>Tasa de impuesto (%)</Label>
              <Input type="number" min="0" max="100" step="0.01" value={invoiceSettings.tax_rate} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tax_rate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <input type="checkbox" id="show-tax" checked={invoiceSettings.show_tax} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, show_tax: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="show-tax">Mostrar impuesto en facturas</Label>
          </div>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium text-slate-800 mb-4">Textos de Factura</h4>
          <div className="flex flex-col space-y-2 mb-4">
            <Label>Pie de pagina</Label>
            <Input placeholder="Gracias por su compra" value={invoiceSettings.footer_text} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, footer_text: e.target.value })} />
          </div>
          <div className="flex flex-col space-y-2">
            <Label>Terminos y condiciones</Label>
            <textarea className="border rounded-md p-2 min-h-[80px] text-sm" placeholder="Terminos y condiciones de venta..." value={invoiceSettings.terms} onChange={(e) => setInvoiceSettings({ ...invoiceSettings, terms: e.target.value })} />
          </div>
        </div>

        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar configuracion"}
        </Button>
      </CardContent>
    </Card>
  );
}

