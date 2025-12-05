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

export default function CashFlowChart({ payments, expenses }) {
  const chartData = useMemo(() => {
    const monthlyData = {};
    
    // Process payments (inflows/outflows)
    payments.forEach((p) => {
      const date = new Date(p.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      if (p.direction === "in") {
        monthlyData[monthKey].ingresos += p.amount || 0;
      } else {
        monthlyData[monthKey].gastos += p.amount || 0;
      }
    });

    // Process expenses
    expenses.forEach((e) => {
      const date = new Date(e.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, ingresos: 0, gastos: 0 };
      }
      
      monthlyData[monthKey].gastos += e.total || 0;
    });

    // Sort by month and get last 6 months
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map((item) => ({
        ...item,
        monthLabel: formatMonth(item.month),
        flujoNeto: item.ingresos - item.gastos,
      }));
  }, [payments, expenses]);

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
          <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
