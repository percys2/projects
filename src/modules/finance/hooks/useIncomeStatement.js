import { useMemo } from "react";

export function useIncomeStatement({ payments, expenses, sales, period, month, year, compareWithPrevious }) {
  
  const getDateRange = (periodType, monthStr, yearStr, offset = 0) => {
    let startDate, endDate;
    
    if (periodType === "month") {
      const [y, m] = monthStr.split("-").map(Number);
      const adjustedMonth = m - 1 - offset;
      const adjustedYear = y + Math.floor(adjustedMonth / 12);
      const finalMonth = ((adjustedMonth % 12) + 12) % 12;
      startDate = new Date(adjustedYear, finalMonth, 1);
      endDate = new Date(adjustedYear, finalMonth + 1, 0);
    } else if (periodType === "quarter") {
      const y = parseInt(yearStr) - Math.floor(offset / 4);
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3) - (offset % 4);
      const quarter = currentQuarter <= 0 ? currentQuarter + 4 : currentQuarter;
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(y, startMonth, 1);
      endDate = new Date(y, startMonth + 3, 0);
    } else {
      const y = parseInt(yearStr) - offset;
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31);
    }
    
    return { startDate, endDate };
  };

  const calculatePeriodData = (periodType, monthStr, yearStr, offset = 0) => {
    const { startDate, endDate } = getDateRange(periodType, monthStr, yearStr, offset);
    const useSalesData = sales && sales.length > 0;
    
    const periodSales = useSalesData ? (sales || []).filter((s) => {
      if (s.status === "canceled" || s.status === "refunded") return false;
      const saleDate = new Date(s.fecha);
      return saleDate >= startDate && saleDate <= endDate;
    }) : [];

    const periodPayments = (payments || []).filter((p) => {
      if (p.direction !== "in") return false;
      const paymentDate = new Date(p.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    const periodExpenses = (expenses || []).filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const incomeByCategory = {};
    let totalCOGS = 0;
    
    if (useSalesData) {
      let totalSalesRevenue = 0;
      periodSales.forEach((s) => {
        totalSalesRevenue += parseFloat(s.total) || 0;
        if (s.sales_items && Array.isArray(s.sales_items)) {
          s.sales_items.forEach((item) => {
            totalCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
          });
        }
      });
      incomeByCategory["Ventas"] = { name: "Ventas", amount: totalSalesRevenue, items: periodSales };
    } else {
      periodPayments.forEach((p) => {
        const category = p.category || "Ventas";
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = { name: category, amount: 0, items: [] };
        }
        incomeByCategory[category].amount += p.amount || 0;
        incomeByCategory[category].items.push(p);
      });
    }

    const expensesByCategory = {};
    periodExpenses.forEach((e) => {
      const category = e.category || e.account_name || "Gastos Generales";
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = { name: category, amount: 0, items: [] };
      }
      expensesByCategory[category].amount += e.total || 0;
      expensesByCategory[category].items.push(e);
    });

    const salesRevenue = incomeByCategory["Ventas"]?.amount || 0;
    const cogs = totalCOGS;
    const grossProfit = salesRevenue - cogs;
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, c) => sum + c.amount, 0);
    const netIncome = grossProfit - totalExpenses;

    return {
      income: Object.values(incomeByCategory).sort((a, b) => b.amount - a.amount),
      expenses: Object.values(expensesByCategory).sort((a, b) => b.amount - a.amount),
      totalIncome: salesRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      netIncome,
      startDate,
      endDate,
      usingSalesData: useSalesData,
    };
  };

  const currentData = useMemo(() => {
    return calculatePeriodData(period, month, year, 0);
  }, [payments, expenses, sales, period, month, year]);

  const previousData = useMemo(() => {
    if (!compareWithPrevious) return null;
    return calculatePeriodData(period, month, year, 1);
  }, [payments, expenses, sales, period, month, year, compareWithPrevious]);

  const periodLabel = useMemo(() => {
    const { startDate } = currentData;
    if (period === "month") {
      return startDate.toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    } else if (period === "quarter") {
      const quarter = Math.ceil((startDate.getMonth() + 1) / 3);
      return `Q${quarter} ${startDate.getFullYear()}`;
    }
    return `Año ${startDate.getFullYear()}`;
  }, [currentData, period]);

  const calculateVariance = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return {
    currentData,
    previousData,
    periodLabel,
    calculateVariance,
  };
}