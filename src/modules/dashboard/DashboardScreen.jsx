"use client";

import React, { useEffect, useState } from "react";
import DashboardKpiCards from "./components/DashboardKpiCards";
import LowStockTable from "./components/LowStockTable";
import TopFeedChart from "./components/TopFeedChart"; 

export default function DashboardScreen({ orgId }) {
  const [data, setData] = useState({
    kpis: {},
    topFeeds: [],
    lowStock: [],
    categoryStats: [],
    loading: true,
  });

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard", {
        headers: { "x-org-id": orgId }
      });
      const json = await res.json();
      
      // Map API response to component structure
      setData({
        kpis: {
          totalSales: json.totalSales,
          clientsCount: json.clientsCount,
          productsCount: json.productsCount,
          inventoryValue: json.inventoryValue,
        },
        lowStock: json.lowStock || [],
        topFeeds: [],
        categoryStats: [],
        loading: false
      });
    }

    if (orgId) load();
  }, [orgId]);

  if (data.loading) return <p className="p-4">Cargando dashboard...</p>;

  return (
    <div className="space-y-6 p-4">

      <DashboardKpiCards kpis={data.kpis} />

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold mb-4">Top productos</h2>
          {data.topFeeds && data.topFeeds.length > 0 ? (
            data.topFeeds.map(item => (
              <div key={item.name} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span>{item.name}</span>
                  <span>{item.stock} uds</span>
                </div>
                <div className="h-2 bg-slate-100 rounded overflow-hidden">
                  <div
                    className="h-full bg-slate-700"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No hay productos disponibles</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold mb-2">Distribución por categoría</h2>
          {data.categoryStats && data.categoryStats.length > 0 ? (
            <div className="text-sm text-slate-600">
              {data.categoryStats.map((cat, i) => (
                <div key={i} className="flex justify-between py-1">
                  <span>{cat.category}</span>
                  <span>{cat.count} productos</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No hay datos disponibles</p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <h2 className="text-sm font-semibold mb-4">Productos con bajo stock</h2>
        <LowStockTable items={data.lowStock} />
      </section>

    </div>
  );
}
