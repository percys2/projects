import React, { useState, useEffect } from "react";
import { formatCurrency } from "@/src/lib/utils/formatCurrency";

/**
 * KPIs Financieros del Agroservicio
 * Basado en datos del POS + Inventario + Kardex
 */
export default function AgroservicioKPIs({ orgSlug }) {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchKPIs();
  }, [orgSlug, dateRange]);

  const fetchKPIs = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/finance/kpis?slug=${orgSlug}&start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await response.json();
      setKpis(data.kpis);
    } catch (error) {
      console.error("Error fetching KPIs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando KPIs...</div>;
  }

  if (!kpis) {
    return <div className="text-center py-8">No hay datos disponibles</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtro de Fechas */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="border rounded px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={fetchKPIs}
            className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* 1. KPIs Financieros */}
      <div>
        <h3 className="text-lg font-semibold mb-3">KPIs Financieros</h3>
        
        {/* Margen Bruto por Categoría */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <h4 className="font-medium mb-3">Margen Bruto por Categoría</h4>
          <div className="space-y-2">
            {kpis.marginByCategory?.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-medium">{cat.category}</span>
                <div className="text-right">
                  <div className="text-sm text-slate-600">
                    Ventas: {formatCurrency(cat.sales)} | COGS: {formatCurrency(cat.cogs)}
                  </div>
                  <div className="font-semibold text-green-600">
                    Margen: {formatCurrency(cat.margin)} ({cat.marginPercent.toFixed(1)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Utilidad Neta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Ventas Totales</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(kpis.totalSales)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">COGS (Costo de Ventas)</div>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(kpis.totalCOGS)}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Gastos Operativos</div>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(kpis.totalExpenses)}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg shadow-sm border-2 border-green-200">
          <div className="text-sm text-green-700 mb-1">Utilidad Neta</div>
          <div className="text-3xl font-bold text-green-700">
            {formatCurrency(kpis.netProfit)}
          </div>
          <div className="text-sm text-green-600 mt-1">
            Margen Neto: {kpis.netMarginPercent.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 2. KPIs Operativos */}
      <div>
        <h3 className="text-lg font-semibold mb-3">KPIs Operativos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Ticket Promedio</div>
            <div className="text-xl font-bold">
              {formatCurrency(kpis.averageTicket)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {kpis.totalTransactions} ventas
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Rotación de Inventario</div>
            <div className="text-xl font-bold">
              {kpis.inventoryTurnover.toFixed(2)}x
            </div>
            <div className="text-xs text-slate-500 mt-1">
              veces por período
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Clientes Activos</div>
            <div className="text-xl font-bold">
              {kpis.activeCustomers}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {kpis.newCustomers} nuevos
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-sm text-slate-600 mb-1">Ventas por Día</div>
            <div className="text-xl font-bold">
              {formatCurrency(kpis.salesPerDay)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              promedio diario
            </div>
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <h4 className="font-medium mb-3">Top 10 Productos Más Vendidos</h4>
          <div className="space-y-2">
            {kpis.topProducts?.slice(0, 10).map((product, idx) => (
              <div key={product.product_id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                  <span className="font-medium">{product.product_name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(product.total_sales)}</div>
                  <div className="text-xs text-slate-500">{product.quantity} unidades</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking de Clientes */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <h4 className="font-medium mb-3">Top 10 Clientes</h4>
          <div className="space-y-2">
            {kpis.topCustomers?.slice(0, 10).map((customer, idx) => (
              <div key={customer.client_id} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-400">#{idx + 1}</span>
                  <span className="font-medium">{customer.client_name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatCurrency(customer.total_spent)}</div>
                  <div className="text-xs text-slate-500">{customer.purchase_count} compras</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Flujo de Caja */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Flujo de Caja</h3>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-600 mb-1">Entradas (Ventas)</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(kpis.cashInflow)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Salidas (Gastos + Compras)</div>
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(kpis.cashOutflow)}
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-600 mb-1">Flujo Neto</div>
              <div className={`text-xl font-bold ${kpis.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(kpis.netCashFlow)}
              </div>
            </div>
          </div>

          {/* Flujo de Caja Diario */}
          <h4 className="font-medium mb-2 text-sm">Flujo Diario (últimos 7 días)</h4>
          <div className="space-y-1">
            {kpis.dailyCashFlow?.map((day) => (
              <div key={day.date} className="flex justify-between items-center p-2 bg-slate-50 rounded text-sm">
                <span>{new Date(day.date).toLocaleDateString('es-NI')}</span>
                <div className="flex gap-4">
                  <span className="text-green-600">+{formatCurrency(day.inflow)}</span>
                  <span className="text-red-600">-{formatCurrency(day.outflow)}</span>
                  <span className={`font-semibold ${day.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(day.net)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. KPIs Específicos del Agroservicio */}
      <div>
        <h3 className="text-lg font-semibold mb-3">KPIs Específicos del Agroservicio</h3>
        
        {/* Rentabilidad por Producto */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-4">
          <h4 className="font-medium mb-3">Rentabilidad por Producto (Top 10)</h4>
          <div className="space-y-2">
            {kpis.productProfitability?.slice(0, 10).map((product) => (
              <div key={product.product_id} className="p-2 bg-slate-50 rounded">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{product.product_name}</span>
                  <span className="font-semibold text-green-600">
                    {product.marginPercent.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Precio: {formatCurrency(product.avg_price)}</span>
                  <span>Costo: {formatCurrency(product.avg_cost)}</span>
                  <span>Margen: {formatCurrency(product.margin)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nivel de Inventario por Sucursal */}
        {kpis.inventoryByLocation && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h4 className="font-medium mb-3">Nivel de Inventario por Sucursal</h4>
            <div className="space-y-2">
              {kpis.inventoryByLocation.map((location) => (
                <div key={location.location} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                  <span className="font-medium">{location.location}</span>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(location.inventory_value)}</div>
                    <div className="text-xs text-slate-500">{location.product_count} productos</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
