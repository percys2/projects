"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

// Helper function to parse dates in various formats (dd/mm/yyyy, yyyy-mm-dd, etc.)
function parseDateFlexible(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  
  if (typeof value === "string") {
    // Try ISO format first (yyyy-mm-dd)
    const iso = new Date(value);
    if (!Number.isNaN(iso.getTime())) return iso;
    
    // Try dd/mm/yyyy or dd-mm-yyyy format
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
    
    // Process sales to calculate gross profit (ventas - costo de venta)
    sales.forEach((s) => {
      if (s.status === "canceled" || s.status === "refunded") return;
      
      const date = parseDateFlexible(s.fecha);
      if (!date) return; // Skip if date cannot be parsed
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      // Add sale total as income
      const saleTotal = parseFloat(s.total) || 0;
      monthlyData[monthKey].ingresos += saleTotal;
      
      // Subtract cost of goods sold (COGS)
      if (s.sales_items && Array.isArray(s.sales_items)) {
        s.sales_items.forEach((item) => {
          const itemCost = (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
          monthlyData[monthKey].ingresos -= itemCost;
        });
      }
    });

    // Process payments for expenses (direction="out")
    payments.forEach((p) => {
      if (p.direction !== "out") return;
      
      const date = parseDateFlexible(p.date);
      if (!date) return; // Skip if date cannot be parsed
      
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      monthlyData[monthKey].gastos += p.amount || 0;
    });

    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
        utilidadNeta: item.ingresos - item.gastos,
      }));
  }, [payments, sales]);

  function formatMonth(monthKey) {
    const [year, month] = monthKey.split("-");
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
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
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickFormatter={(value) => `C$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value) => [`C$ ${value.toLocaleString("es-NI")}`, ""]}
            labelStyle={{ fontWeight: "bold" }}
          />
          <Legend />
          <Bar dataKey="ingresos" name="Ingresos (Utilidad Bruta)" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}