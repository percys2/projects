"use client";

import { useMemo } from "react";
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle, Wallet, Receipt } from "lucide-react";

export default function FinanceKpiHeader({ stats, receivables, payables, cashAccounts }) {
  const kpis = useMemo(() => {
    const today = new Date();
    
    const overdueReceivables = receivables
      .filter((r) => r.due_date && new Date(r.due_date) < today && r.status !== "paid")
      .reduce((sum, r) => sum + ((r.total || 0) - (r.amount_paid || 0)), 0);

    const overduePayables = payables
      .filter((p) => p.due_date && new Date(p.due_date) < today && p.status !== "paid")
      .reduce((sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)), 0);

    const cashBalance = cashAccounts?.reduce((sum, a) => sum + (a.balance || 0), 0) || 0;

    return {
      monthlyIncome: stats.monthlyIncome || 0,
      monthlyGrossProfit: stats.monthlyGrossProfit || 0,
      monthlyCOGS: stats.monthlyCOGS || 0,
      cashIn: stats.cashIn || 0,
      cashOut: stats.cashOut || 0,
      netCashFlow: stats.netCashFlow || 0,
      totalReceivables: stats.totalReceivables || 0,
      totalPayables: stats.totalPayables || 0,
      overdueReceivables,
      overduePayables,
      cashBalance,
      monthlyExpenses: stats.monthlyExpenses || 0,
    };
  }, [stats, receivables, payables, cashAccounts]);

  const cards = [
    {
      title: "Ingresos del Mes",
      value: kpis.monthlyIncome,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Gastos del Mes",
      value: kpis.monthlyExpenses,
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Flujo Neto",
      value: kpis.netCashFlow,
      icon: DollarSign,
      color: kpis.netCashFlow >= 0 ? "text-emerald-600" : "text-red-600",
      bg: kpis.netCashFlow >= 0 ? "bg-emerald-50" : "bg-red-50",
    },
    {
      title: "Por Cobrar",
      value: kpis.totalReceivables,
      icon: Receipt,
      color: "text-blue-600",
      bg: "bg-blue-50",
      subtitle: kpis.overdueReceivables > 0 ? `C$ ${kpis.overdueReceivables.toLocaleString("es-NI")} vencido` : null,
      subtitleColor: "text-red-500",
    },
    {
      title: "Por Pagar",
      value: kpis.totalPayables,
      icon: Wallet,
      color: "text-orange-600",
      bg: "bg-orange-50",
      subtitle: kpis.overduePayables > 0 ? `C$ ${kpis.overduePayables.toLocaleString("es-NI")} vencido` : null,
      subtitleColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className={`${card.bg} rounded-xl p-4 border`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-600">{card.title}</span>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </div>
          <p className={`text-lg font-bold ${card.color}`}>
            C$ {card.value.toLocaleString("es-NI")}
          </p>
          {card.subtitle && (
            <p className={`text-[10px] mt-1 ${card.subtitleColor}`}>
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              {card.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}