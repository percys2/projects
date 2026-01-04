"use client";

import { useMemo } from "react";
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

export default function CashFlowChart({ payments, sales = [] }) {
  const chartData = useMemo(() => {
    const monthlyData = {};
    
    sales.forEach((s) => {
      if (s.status === "canceled" || s.status === "refunded") return;
      
      const date = parseDateFlexible(s.fecha);
      if (!date) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      const saleTotal = parseFloat(s.total) || 0;
      monthlyData[monthKey].ingresos += saleTotal;
      
      if (s.sales_items && Array.isArray(s.sales_items)) {
        s.sales_items.forEach((item) => {
          const itemCost = (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
          monthlyData[monthKey].ingresos -= itemCost;
        });
      }
    });

    payments.forEach((p) => {
      if (p.direction !== "out") return;
      
      const date = parseDateFlexible(p.date);
      if (!date) return;
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      monthlyData[monthKey].gastos += p.amount || 0;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)
      .map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
        utilidadNeta: item.ingresos - item.gastos,
      }));
  }, [payments, sales]);

  function formatMonth(monthKey) {
    const [year, month] = monthKey.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(month) - 1]} ${year}`;
  }

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No hay datos suficientes para mostrar el gráfico
      </div>
    );
  }

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
          <YAxis 
            tick={{ fontSize: 11 }} 
            tickFormatter={(value) => `C$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value) => [`C$ ${value.toLocaleString("es-NI", { minimumFractionDigits: 2 })}`, ""]}
            labelStyle={{ fontWeight: "bold" }}
            contentStyle={{ fontSize: 12 }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="ingresos" 
            name="Ingresos (Utilidad Bruta)" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="gastos" 
            name="Gastos" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}