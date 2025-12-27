"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp, TrendingDown, DollarSign, Users } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useDashboard } from "./hooks/useDashboard";
import { formatCurrency, formatPercent } from "@/src/lib/formatters/currency";
import KpiCard from "@/src/components/ui/KpiCard";
import AlertsPanel from "./components/AlertsPanel";
import QuickActions from "./components/QuickActions";

export default function DashboardScreen({ orgSlug }) {
  const router = useRouter();
  const [period, setPeriod] = useState("30");
  const { data, loading, error, overdueStats, chartData } = useDashboard({ orgSlug, period });

  const handleNavigate = (module) => router.push(`/${orgSlug}/${module}`);

  if (loading) return <div className="p-4 text-center">Cargando dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!data) return <div className="p-4">No hay datos disponibles</div>;

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Resumen de tu negocio agropecuario</p>
        </div>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto">
          <option value="7">Ultimos 7 dias</option>
          <option value="30">Ultimos 30 dias</option>
          <option value="90">Ultimos 90 dias</option>
          <option value="365">Ultimo ano</option>
        </select>
      </div>

      {/* Alerts */}
      <AlertsPanel overdueStats={overdueStats} lowStock={data.lowStock} onNavigate={handleNavigate} />

      {/* Quick Actions */}
      <QuickActions onNavigate={handleNavigate} />

      {/* KPI Cards Row 1 - Financial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <KpiCard title="Ingresos" value={formatCurrency(data.kpis.revenue)} subtitle={`${data.kpis.salesCount} ventas`} icon={TrendingUp} variant="secondary" />
        <KpiCard title="Ganancia Bruta" value={formatCurrency(data.kpis.grossProfit)} subtitle={`Margen: ${formatPercent(data.kpis.grossMarginPct)}`} icon={DollarSign} variant="primary" />
        <KpiCard title="Costo de Ventas" value={formatCurrency(data.kpis.cogs)} subtitle="COGS" icon={TrendingDown} variant="muted" />
        <KpiCard title="Pipeline CRM" value={formatCurrency(data.kpis.pipelineValue)} subtitle="Oportunidades abiertas" icon={Users} variant="primary" />
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-xl border p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Ventas vs Costos</h2>
        <div className="h-48 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`C$ ${value.toLocaleString("es-NI")}`, ""]} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Costos" fill="#64748b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards Row 2 - Inventory */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <KpiCard title="Valor Inventario" value={formatCurrency(data.kpis.inventoryValue)} subtitle="Capital invertido" variant="secondary" />
        <KpiCard title="Ganancia Potencial" value={formatCurrency(data.kpis.potentialGrossProfit)} subtitle="Si vendes todo" variant="primary" />
        <KpiCard title="Rotacion Inventario" value={`${data.profitability.inventoryTurnover}x`} subtitle="Anualizado" variant="muted" />
        <KpiCard title="Dias de Stock" value={data.profitability.daysInventoryOnHand} subtitle="Dias disponibles" variant="primary" />
      </div>

      {/* Counts Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-3xl font-bold text-slate-700">{data.kpis.clientsCount}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Clientes</p>
        </div>
        <div className="bg-white rounded-xl border p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-3xl font-bold text-slate-700">{data.kpis.productsCount}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Productos</p>
        </div>
        <div className="bg-white rounded-xl border p-3 sm:p-4 text-center">
          <p className="text-xl sm:text-3xl font-bold text-slate-700">{data.kpis.employeesCount}</p>
          <p className="text-[10px] sm:text-xs text-slate-500">Empleados</p>
        </div>
      </div>

      {/* Top Clients & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <h2 className="text-sm font-semibold mb-4">Top 10 Clientes</h2>
          {data.topClients?.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.topClients.map((client, i) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{client.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{client.orderCount} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(client.totalSales)}</p>
                    <p className="text-[10px] sm:text-xs text-blue-500">{formatPercent(client.marginPct)} margen</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">No hay datos de clientes</p>
          )}
        </div>

        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <h2 className="text-sm font-semibold mb-4">Top 10 Productos</h2>
          {data.topProducts?.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.topProducts.map((product, i) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{product.quantitySold} unidades</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                    <p className="text-[10px] sm:text-xs text-blue-500">{formatPercent(product.marginPct)} margen</p>
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
      <div className="bg-white rounded-xl border p-3 sm:p-4">
        <h2 className="text-sm font-semibold mb-4">Inventario por Categoria</h2>
        {data.inventoryByCategory?.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-slate-500 border-b">
                  <th className="pb-2 px-2">Categoria</th>
                  <th className="pb-2 px-2 text-right">Unidades</th>
                  <th className="pb-2 px-2 text-right">Valor Inv.</th>
                  <th className="pb-2 px-2 text-right hidden sm:table-cell">Ingreso Pot.</th>
                  <th className="pb-2 px-2 text-right">Ganancia</th>
                  <th className="pb-2 px-2 text-right">Margen</th>
                </tr>
              </thead>
              <tbody>
                {data.inventoryByCategory.map((cat) => (
                  <tr key={cat.category} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{cat.category}</td>
                    <td className="py-2 px-2 text-right">{cat.totalUnits}</td>
                    <td className="py-2 px-2 text-right whitespace-nowrap">{formatCurrency(cat.inventoryValue)}</td>
                    <td className="py-2 px-2 text-right whitespace-nowrap hidden sm:table-cell">{formatCurrency(cat.potentialRevenue)}</td>
                    <td className="py-2 px-2 text-right text-blue-600 whitespace-nowrap">{formatCurrency(cat.potentialGrossProfit)}</td>
                    <td className="py-2 px-2 text-right">{formatPercent(cat.marginPct)}</td>
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
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 sm:p-4">
          <h2 className="text-sm font-semibold text-amber-700 mb-4">Productos con Bajo Stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.lowStock.slice(0, 8).map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-2 border border-amber-100">
                <p className="text-[10px] sm:text-xs font-medium truncate">{item.products?.name || "Producto"}</p>
                <p className="text-base sm:text-lg font-bold text-amber-600">{item.quantity}</p>
                <p className="text-[10px] sm:text-xs text-amber-400">unidades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
