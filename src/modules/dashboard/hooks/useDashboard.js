import { useState, useEffect, useMemo, useCallback } from "react";

export function useDashboard({ orgSlug, period = "30", month = null }) {
  const [data, setData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!orgSlug) return;
    
    try {
      setLoading(true);
      const headers = { "x-org-slug": orgSlug };

      let dashUrl = "/api/dashboard";
      if (month) {
        dashUrl += `?month=${month}`;
      } else {
        dashUrl += `?range=${period}`;
      }

      const [dashRes, receivablesRes, payablesRes] = await Promise.all([
        fetch(dashUrl, { headers }),
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
  }, [orgSlug, period, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overdueStats = useMemo(() => {
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
  }, [financeData]);

  const chartData = useMemo(() => {
    if (!data?.kpis) return [];
    
    const days = parseInt(period);
    const result = [];
    const baseRevenue = data.kpis.revenue || 0;
    const baseCogs = data.kpis.cogs || 0;
    
    for (let i = days - 1; i >= 0; i -= Math.ceil(days / 7)) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const multiplier = 0.7 + ((i % 7) * 0.1);
      result.push({
        day: date.toLocaleDateString("es-NI", { day: "2-digit", month: "short" }),
        ventas: Math.round((baseRevenue / 7) * multiplier),
        gastos: Math.round((baseCogs / 7) * multiplier),
      });
    }
    return result.slice(-7);
  }, [data?.kpis?.revenue, data?.kpis?.cogs, period]);

  return {
    data,
    loading,
    error,
    overdueStats,
    chartData,
    refresh: loadData,
  };
}