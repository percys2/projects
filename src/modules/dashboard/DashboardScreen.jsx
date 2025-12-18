"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Plus,
  Receipt,
  Wallet,
  UserPlus,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function DashboardScreen({ orgSlug }) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const headers = { "x-org-slug": orgSlug };

        const [dashRes, receivablesRes, payablesRes] = await Promise.all([
          fetch(`/api/dashboard?range=${period}`, { headers }),
          fetch("/api/finance/reports/receivables", { headers }),
          fetch("/api/finance/reports/payables", { headers }),
        ]);

        if (!dashRes.ok) throw new Error("Error al cargar dashboard");

        const [dashJson, receivablesJson, payablesJson] = await Promise.all([
          dashRes.json(),
          receivablesRes.json(),
          payablesRes.json(),
        ]);

        setData(dashJson);
        setFinanceData({
          receivables: receivablesJson.receivables || [],
          payables: payablesJson.payables || [],
        });
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

  const formatCurrency = (amount) =>
    `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const formatPercent = (value) => `${(value || 0).toFixed(1)}%`;

  // Calculate overdue amounts
  const getOverdueStats = () => {
    if (!financeData) return { overdueReceivables: 0, overduePayables: 0, upcomingPayables: 0 };
    
    const today = new Date();
    const sevenDays = new Date(today);
    sevenDays.setDate(sevenDays.getDate() + 7);

    const overdueReceivables = financeData.receivables
      .filter((r) => r.due_date && new Date(r.due_date) < today && r.status !== "paid")
      .reduce((sum, r) => sum + ((r.total || 0) - (r.amount_paid || 0)), 0);

    const overduePayables = financeData.payables
      .filter((p) => p.due_date && new Date(p.due_date) < today && p.status !== "paid")
      .reduce((sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)), 0);

    const upcomingPayables = financeData.payables
      .filter((p) => {
        if (!p.due_date || p.status === "paid") return false;
        const due = new Date(p.due_date);
        return due >= today && due <= sevenDays;
      })
      .reduce((sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)), 0);

    return { overdueReceivables, overduePayables, upcomingPayables };
  };

  // PERFORMANCE FIX: Memoize overdue stats to prevent recalculation on every render
  const overdueStats = useMemo(() => getOverdueStats(), [financeData]);

  // PERFORMANCE FIX: Memoize chart data - removed Math.random() which caused constant re-renders
  // Now uses deterministic values based on day index for consistent rendering
  const chartData = useMemo(() => {
    if (!data?.kpis) return [];
    
    const days = parseInt(period);
    const result = [];
    const baseRevenue = data.kpis.revenue || 0;
    const baseCogs = data.kpis.cogs || 0;
    
    for (let i = days - 1; i >= 0; i -= Math.ceil(days / 7)) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      // Use deterministic multiplier based on day index instead of Math.random()
      const multiplier = 0.7 + ((i % 7) * 0.1);
      result.push({
        day: date.toLocaleDateString("es-NI", { day: "2-digit", month: "short" }),
        ventas: Math.round((baseRevenue / 7) * multiplier),
        gastos: Math.round((baseCogs / 7) * multiplier),
      });
    }
    return result.slice(-7);
  }, [data?.kpis?.revenue, data?.kpis?.cogs, period]);

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
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm w-full sm:w-auto"
        >
          <option value="7">Ultimos 7 dias</option>
          <option value="30">Ultimos 30 dias</option>
          <option value="90">Ultimos 90 dias</option>
          <option value="365">Ultimo ano</option>
        </select>
      </div>

      {/* Alerts Section */}
      {(overdueStats.overdueReceivables > 0 || overdueStats.overduePayables > 0 || data.lowStock?.length > 0) && (
        <div className="space-y-2">
          {overdueStats.overdueReceivables > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700">
                  Cuentas por cobrar vencidas: {formatCurrency(overdueStats.overdueReceivables)}
                </p>
              </div>
              <button
                onClick={() => router.push(`/${orgSlug}/finance`)}
                className="text-xs text-red-600 hover:underline whitespace-nowrap"
              >
                Ver detalles
              </button>
            </div>
          )}
          {overdueStats.overduePayables > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-700">
                  Cuentas por pagar vencidas: {formatCurrency(overdueStats.overduePayables)}
                </p>
              </div>
              <button
                onClick={() => router.push(`/${orgSlug}/finance`)}
                className="text-xs text-orange-600 hover:underline whitespace-nowrap"
              >
                Ver detalles
              </button>
            </div>
          )}
          {data.lowStock?.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <Package className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700">
                  {data.lowStock.length} productos con stock bajo
                </p>
              </div>
              <button
                onClick={() => router.push(`/${orgSlug}/inventory`)}
                className="text-xs text-yellow-600 hover:underline whitespace-nowrap"
              >
                Ver inventario
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border p-3 sm:p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Acciones Rapidas</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          <button
            onClick={() => router.push(`/${orgSlug}/pos`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition min-h-[70px]"
          >
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
            <span className="text-[10px] sm:text-xs font-medium text-emerald-700 text-center">Nueva Venta</span>
          </button>
          <button
            onClick={() => router.push(`/${orgSlug}/crm`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition min-h-[70px]"
          >
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            <span className="text-[10px] sm:text-xs font-medium text-blue-700 text-center">Nuevo Cliente</span>
          </button>
          <button
            onClick={() => router.push(`/${orgSlug}/finance`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-red-50 rounded-lg hover:bg-red-100 transition min-h-[70px]"
          >
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            <span className="text-[10px] sm:text-xs font-medium text-red-700 text-center">Registrar Gasto</span>
          </button>
          <button
            onClick={() => router.push(`/${orgSlug}/finance`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition min-h-[70px]"
          >
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            <span className="text-[10px] sm:text-xs font-medium text-purple-700 text-center">Registrar Pago</span>
          </button>
          <button
            onClick={() => router.push(`/${orgSlug}/inventory`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition min-h-[70px]"
          >
            <Package className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
            <span className="text-[10px] sm:text-xs font-medium text-indigo-700 text-center">Ver Inventario</span>
          </button>
          <button
            onClick={() => router.push(`/${orgSlug}/sales`)}
            className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition min-h-[70px]"
          >
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-slate-600" />
            <span className="text-[10px] sm:text-xs font-medium text-slate-700 text-center">Ver Ventas</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row 1 - Financial */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs text-slate-500">Ingresos</p>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-800">{formatCurrency(data.kpis.revenue)}</p>
          <p className="text-[10px] sm:text-xs text-slate-400">{data.kpis.salesCount} ventas</p>
        </div>
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs text-slate-500">Ganancia Bruta</p>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-base sm:text-xl font-bold text-emerald-600">{formatCurrency(data.kpis.grossProfit)}</p>
          <p className="text-[10px] sm:text-xs text-emerald-500">Margen: {formatPercent(data.kpis.grossMarginPct)}</p>
        </div>
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs text-slate-500">Costo de Ventas</p>
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-base sm:text-xl font-bold text-red-600">{formatCurrency(data.kpis.cogs)}</p>
          <p className="text-[10px] sm:text-xs text-slate-400">COGS</p>
        </div>
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] sm:text-xs text-slate-500">Pipeline CRM</p>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-base sm:text-xl font-bold text-blue-600">{formatCurrency(data.kpis.pipelineValue)}</p>
          <p className="text-[10px] sm:text-xs text-blue-400">Oportunidades abiertas</p>
        </div>
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
              <Bar dataKey="ventas" name="Ventas" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Costos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Cards Row 2 - Inventory */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-indigo-600">Valor Inventario</p>
          <p className="text-base sm:text-xl font-bold text-indigo-700">{formatCurrency(data.kpis.inventoryValue)}</p>
          <p className="text-[10px] sm:text-xs text-indigo-500">Capital invertido</p>
        </div>
        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-emerald-600">Ganancia Potencial</p>
          <p className="text-base sm:text-xl font-bold text-emerald-700">{formatCurrency(data.kpis.potentialGrossProfit)}</p>
          <p className="text-[10px] sm:text-xs text-emerald-500">Si vendes todo</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-amber-600">Rotacion Inventario</p>
          <p className="text-base sm:text-xl font-bold text-amber-700">{data.profitability.inventoryTurnover}x</p>
          <p className="text-[10px] sm:text-xs text-amber-500">Anualizado</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-200 p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-purple-600">Dias de Stock</p>
          <p className="text-base sm:text-xl font-bold text-purple-700">{data.profitability.daysInventoryOnHand}</p>
          <p className="text-[10px] sm:text-xs text-purple-500">Dias disponibles</p>
        </div>
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

      {/* Top Clients & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl border p-3 sm:p-4">
          <h2 className="text-sm font-semibold mb-4">Top 10 Clientes</h2>
          {data.topClients?.length > 0 ? (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.topClients.map((client, i) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{client.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{client.orderCount} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(client.totalSales)}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-500">{formatPercent(client.marginPct)} margen</p>
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
                    <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] sm:text-xs font-medium flex-shrink-0">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                      <p className="text-[10px] sm:text-xs text-slate-400">{product.quantitySold} unidades</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <p className="text-xs sm:text-sm font-semibold">{formatCurrency(product.revenue)}</p>
                    <p className="text-[10px] sm:text-xs text-emerald-500">{formatPercent(product.marginPct)} margen</p>
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
                    <td className="py-2 px-2 text-right text-emerald-600 whitespace-nowrap">{formatCurrency(cat.potentialGrossProfit)}</td>
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
        <div className="bg-red-50 rounded-xl border border-red-200 p-3 sm:p-4">
          <h2 className="text-sm font-semibold text-red-700 mb-4">Productos con Bajo Stock</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {data.lowStock.slice(0, 8).map((item, i) => (
              <div key={i} className="bg-white rounded-lg p-2 border border-red-100">
                <p className="text-[10px] sm:text-xs font-medium truncate">{item.products?.name || "Producto"}</p>
                <p className="text-base sm:text-lg font-bold text-red-600">{item.quantity}</p>
                <p className="text-[10px] sm:text-xs text-red-400">unidades</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}