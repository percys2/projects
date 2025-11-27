"use client";

import React, { useEffect, useState } from "react";

export default function DashboardScreen({ orgSlug }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/dashboard?range=${period}`, {
          headers: { "x-org-slug": orgSlug }
        });
        
        if (!res.ok) throw new Error("Error al cargar dashboard");
        
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (orgSlug) load();
  }, [orgSlug, period]);

  const formatCurrency = (amount) => `C$ ${(amount || 0).toLocaleString("es-NI", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  if (loading) return <div className="p-4 text-center">Cargando dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4">No hay datos disponibles</div>;

  return (
    <div className="space-y-6 p-4">
      {/* Header with period selector */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500">Resumen de tu negocio</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
          <option value="90">Últimos 90 días</option>
          <option value="365">Último año</option>
        </select>
      </div>

      {/* KPI Cards Row 1 - Financial */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Ingresos</p>
          <p className="text-xl font-bold text-slate-800">{formatCurrency(data.kpis.revenue)}</p>
          <p className="text-xs text-slate-400">{data.kpis.salesCount} ventas</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Ganancia Bruta</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(data.kpis.grossProfit)}</p>
          <p className="text-xs text-emerald-500">Margen: {formatPercent(data.kpis.grossMarginPct)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Costo de Ventas</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(data.kpis.cogs)}</p>
          <p className="text-xs text-slate-400">COGS</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-slate-500">Pipeline CRM</p>
          <p className="text-xl font-bold text-blue-600">{formatCurrency(data.kpis.pipelineValue)}</p>
          <p className="text-xs text-blue-400">Oportunidades abiertas</p>
        </div>
      </div>

      {/* KPI Cards Row 2 - Inventory */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4">
          <p className="text-xs text-indigo-600">Valor Inventario</p>
          <p className="text-xl font-bold text-indigo-700">{formatCurrency(data.kpis.inventoryValue)}</p>
          <p className="text-xs text-indigo-500">Capital invertido</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
          <p className="text-xs text-emerald-600">Ganancia Potencial</p>
          <p className="text-xl font-bold text-emerald-700">{formatCurrency(data.kpis.potentialGrossProfit)}</p>
          <p className="text-xs text-emerald-500">Si vendes todo</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-xs text-amber-600">Rotación Inventario</p>
          <p className="text-xl font-bold text-amber-700">{data.profitability.inventoryTurnover}x</p>
          <p className="text-xs text-amber-500">Anualizado</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
          <p className="text-xs text-purple-600">Días de Stock</p>
          <p className="text-xl font-bold text-purple-700">{data.profitability.daysInventoryOnHand}</p>
          <p className="text-xs text-purple-500">Días disponibles</p>
        </div>
      </div>

      {/* Counts Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-slate-700">{data.kpis.clientsCount}</p>
          <p className="text-xs text-slate-500">Clientes</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-slate-700">{data.kpis.productsCount}</p>
          <p className="text-xs text-slate-500">Productos</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <p className="text-3xl font-bold text-slate-700">{data.kpis.employeesCount}</p>
          <p className="text-xs text-slate-500">Empleados</p>
        </div>
      </div>

      {/* Top Clients & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Clients */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-4">Top 10 Clientes</h2>
          {data.topClients?.length > 0 ? (
            <div className="space-y-2">
              {data.topClients.map((client, i) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-slate-400">{client.orderCount} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(client.totalSales)}</p>
                    <p className="text-xs text-emerald-500">{formatPercent(client.marginPct)} margen</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No hay datos de clientes</p>
          )}
        </div>

        {/* Top 10 Products */}
        <div className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-4">Top 10 Productos</h2>
          {data.topProducts?.length > 0 ? (
            <div className="space-y-2">
              {data.topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium">{product.name}</p>
                      <p className="text-xs text-slate-400">{product.quantitySold} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                    <p className="text-xs text-emerald-500">{formatPercent(product.marginPct)} margen</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No hay datos de productos</p>
          )}
        </div>
      </div>

      {/* Inventory by Category */}
      <div className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-semibold mb-4">Inventario por Categoría</h2>
        {data.inventoryByCategory?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2">Categoría</th>
                  <th className="pb-2 text-right">Unidades</th>
                  <th className="pb-2 text-right">Valor Inventario</th>
                  <th className="pb-2 text-right">Ingreso Potencial</th>
                  <th className="pb-2 text-right">Ganancia Potencial</th>
                  <th className="pb-2 text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {data.inventoryByCategory.map((cat) => (
                  <tr key={cat.category} className="border-b last:border-0">
                    <td className="py-2 font-medium">{cat.category}</td>
                    <td className="py-2 text-right">{cat.totalUnits}</td>
                    <td className="py-2 text-right">{formatCurrency(cat.inventoryValue)}</td>
                    <td className="py-2 text-right">{formatCurrency(cat.potentialRevenue)}</td>
                    <td className="py-2 text-right text-emerald-600">{formatCurrency(cat.potentialGrossProfit)}</td>
                    <td className="py-2 text-right">{formatPercent(cat.marginPct)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-400 text-center py-4">No hay datos de inventario</p>
        )}
      </div>

      {/* Low Stock Alert */}
      {data.lowStock?.length > 0 && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-4">Productos con Bajo Stock</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {data.lowStock.slice(0, 8).map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-2 border border-red-100">
                <p className="text-xs font-medium truncate">{item.products?.name || "Producto"}</p>
                <p className="text-lg font-bold text-red-600">{item.quantity}</p>
                <p className="text-xs text-red-400">unidades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
