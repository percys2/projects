"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

function parseDateFlexible(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  
  if (typeof value === "string") {
    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso;
    
    const match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]);
      const year = Number(match[3]);
      return new Date(year, month - 1, day);
    }
  }
  return null;
}

export default function ExpenseTrendChart({ expenses }) {
  const [viewMode, setViewMode] = useState("month");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const chartData = useMemo(() => {
    const data = {};
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59, 999);

    expenses.forEach((e) => {
      const date = parseDateFlexible(e.date);
      if (!date) return;
      if (date < startDate || date > endDate) return;

      let key;
      let label;

      if (viewMode === "day") {
        key = date.toISOString().slice(0, 10);
        label = `${date.getDate()}/${date.getMonth() + 1}`;
      } else if (viewMode === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        label = `Sem ${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        label = `${months[date.getMonth()]} ${String(date.getFullYear()).slice(2)}`;
      }

      if (!data[key]) {
        data[key] = { key, label, total: 0, count: 0 };
      }
      data[key].total += e.total || 0;
      data[key].count += 1;
    });

    return Object.values(data).sort((a, b) => a.key.localeCompare(b.key));
  }, [expenses, viewMode, dateRange]);

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No hay datos de gastos en el periodo seleccionado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("day")}
            className={`px-3 py-1 text-xs rounded-lg ${viewMode === "day" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Por Dia
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`px-3 py-1 text-xs rounded-lg ${viewMode === "week" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Por Semana
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1 text-xs rounded-lg ${viewMode === "month" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            Por Mes
          </button>
        </div>
        <div className="flex gap-2 items-center text-xs">
          <label className="text-slate-500">Desde:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
            className="px-2 py-1 border rounded text-xs"
          />
          <label className="text-slate-500">Hasta:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
            className="px-2 py-1 border rounded text-xs"
          />
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => `C$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value) => [`C$ ${value.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`, "Total Gastos"]}
              labelStyle={{ fontWeight: "bold" }}
              contentStyle={{ fontSize: 12 }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="total"
              name="Gastos Totales"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="text-xs text-slate-500 text-center">
        Total en periodo: C$ {chartData.reduce((sum, d) => sum + d.total, 0).toLocaleString("es-NI", { minimumFractionDigits: 2 })} 
        {" "}({chartData.reduce((sum, d) => sum + d.count, 0)} registros)
      </div>
    </div>
  );
}