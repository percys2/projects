"use client";

import React, { useState, useMemo } from "react";

export default function IncomeStatement({ payments, expenses, sales = [], orgName = "Mi Empresa" }) {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [compareWithPrevious, setCompareWithPrevious] = useState(false);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getDateRange = (period, month, year, offset = 0) => {
    let startDate, endDate;
    
    if (period === "month") {
      const [y, m] = month.split("-").map(Number);
      const adjustedMonth = m - 1 - offset;
      const adjustedYear = y + Math.floor(adjustedMonth / 12);
      const finalMonth = ((adjustedMonth % 12) + 12) % 12;
      startDate = new Date(adjustedYear, finalMonth, 1);
      endDate = new Date(adjustedYear, finalMonth + 1, 0);
    } else if (period === "quarter") {
      const y = parseInt(year) - Math.floor(offset / 4);
      const currentQuarter = Math.ceil((new Date().getMonth() + 1) / 3) - (offset % 4);
      const quarter = currentQuarter <= 0 ? currentQuarter + 4 : currentQuarter;
      const startMonth = (quarter - 1) * 3;
      startDate = new Date(y, startMonth, 1);
      endDate = new Date(y, startMonth + 3, 0);
    } else {
      const y = parseInt(year) - offset;
      startDate = new Date(y, 0, 1);
      endDate = new Date(y, 11, 31);
    }
    
    return { startDate, endDate };
  };

  const calculatePeriodData = (period, month, year, offset = 0) => {
    const { startDate, endDate } = getDateRange(period, month, year, offset);
    
    // Use sales data for income (accrual basis) if available, otherwise fall back to payments
    const useSalesData = sales && sales.length > 0;
    
    // Filter sales for the period (exclude canceled/refunded)
    const periodSales = useSalesData ? (sales || []).filter((s) => {
      if (s.status === "canceled" || s.status === "refunded") return false;
      const saleDate = new Date(s.fecha);
      return saleDate >= startDate && saleDate <= endDate;
    }) : [];

    // Filter payments (income) for the period - used as fallback or for cash flow
    const periodPayments = (payments || []).filter((p) => {
      if (p.direction !== "in") return false;
      const paymentDate = new Date(p.date);
      return paymentDate >= startDate && paymentDate <= endDate;
    });

    // Filter expenses for the period
    const periodExpenses = (expenses || []).filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Calculate income from sales (accrual basis)
    const incomeByCategory = {};
    
    if (useSalesData) {
      // Calculate revenue from sales
      let totalSalesRevenue = 0;
      let totalCOGS = 0;
      
      periodSales.forEach((s) => {
        totalSalesRevenue += parseFloat(s.total) || 0;
        // Calculate COGS from sales_items if available
        if (s.sales_items && Array.isArray(s.sales_items)) {
          s.sales_items.forEach((item) => {
            totalCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
          });
        }
      });
      
      incomeByCategory["Ventas"] = { name: "Ventas", amount: totalSalesRevenue, items: periodSales };
      
      // Add COGS as a separate category if we have cost data
      if (totalCOGS > 0) {
        incomeByCategory["Costo de Ventas"] = { name: "Costo de Ventas", amount: -totalCOGS, items: [], isCost: true };
      }
    } else {
      // Fallback to payments if no sales data
      periodPayments.forEach((p) => {
        const category = p.category || "Ventas";
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = { name: category, amount: 0, items: [] };
        }
        incomeByCategory[category].amount += p.amount || 0;
        incomeByCategory[category].items.push(p);
      });
    }

    // Group expenses by category
    const expensesByCategory = {};
    periodExpenses.forEach((e) => {
      const category = e.category || e.account_name || "Gastos Generales";
      if (!expensesByCategory[category]) {
        expensesByCategory[category] = { name: category, amount: 0, items: [] };
      }
      expensesByCategory[category].amount += e.total || 0;
      expensesByCategory[category].items.push(e);
    });

    // Calculate totals
    const salesRevenue = incomeByCategory["Ventas"]?.amount || 0;
    const cogs = Math.abs(incomeByCategory["Costo de Ventas"]?.amount || 0);
    const grossProfit = salesRevenue - cogs;
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, c) => sum + c.amount, 0);
    const operatingIncome = grossProfit - totalExpenses;
    const netIncome = operatingIncome;

    // Filter out COGS from income display (it's shown separately)
    const incomeItems = Object.values(incomeByCategory)
      .filter(c => !c.isCost)
      .sort((a, b) => b.amount - a.amount);

    return {
      income: incomeItems,
      expenses: Object.values(expensesByCategory).sort((a, b) => b.amount - a.amount),
      totalIncome: salesRevenue,
      cogs,
      grossProfit,
      totalExpenses,
      operatingExpenses: totalExpenses,
      operatingIncome,
      netIncome,
      startDate,
      endDate,
      usingSalesData: useSalesData,
    };
  };

  const currentData = useMemo(() => {
    return calculatePeriodData(selectedPeriod, selectedMonth, selectedYear, 0);
  }, [payments, expenses, sales, selectedPeriod, selectedMonth, selectedYear]);

  const previousData = useMemo(() => {
    if (!compareWithPrevious) return null;
    return calculatePeriodData(selectedPeriod, selectedMonth, selectedYear, 1);
  }, [payments, expenses, sales, selectedPeriod, selectedMonth, selectedYear, compareWithPrevious]);

  const calculateVariance = (current, previous) => {
    if (!previous || previous === 0) return null;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const periodLabel = useMemo(() => {
    const { startDate, endDate } = currentData;
    if (selectedPeriod === "month") {
      return startDate.toLocaleDateString("es-NI", { year: "numeric", month: "long" });
    } else if (selectedPeriod === "quarter") {
      const quarter = Math.ceil((startDate.getMonth() + 1) / 3);
      return `Q${quarter} ${startDate.getFullYear()}`;
    } else {
      return `Año ${startDate.getFullYear()}`;
    }
  }, [currentData, selectedPeriod]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Estado de Resultados - ${periodLabel}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header h2 { font-size: 14px; font-weight: normal; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
            td.right { text-align: right; }
            .section-header { background: #e8e8e8; font-weight: bold; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .grand-total { background: #333; color: white; font-weight: bold; font-size: 13px; }
            .positive { color: #059669; }
            .negative { color: #dc2626; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>ESTADO DE RESULTADOS</h2>
            <p>Periodo: ${periodLabel}</p>
            <p>Generado: ${new Date().toLocaleDateString("es-NI")}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 60%;">Concepto</th>
                <th style="width: 20%;" class="right">Monto</th>
                <th style="width: 20%;" class="right">% del Total</th>
              </tr>
            </thead>
            <tbody>
              <tr class="section-header">
                <td colspan="3">INGRESOS</td>
              </tr>
              ${currentData.income.map((item) => `
                <tr>
                  <td style="padding-left: 20px;">${item.name}</td>
                  <td class="right">${formatCurrency(item.amount)}</td>
                  <td class="right">${currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td>Total Ingresos</td>
                <td class="right">${formatCurrency(currentData.totalIncome)}</td>
                <td class="right">100%</td>
              </tr>
              
              <tr class="section-header">
                <td colspan="3">GASTOS OPERATIVOS</td>
              </tr>
              ${currentData.expenses.map((item) => `
                <tr>
                  <td style="padding-left: 20px;">${item.name}</td>
                  <td class="right">${formatCurrency(item.amount)}</td>
                  <td class="right">${currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0}%</td>
                </tr>
              `).join("")}
              <tr class="total-row">
                <td>Total Gastos Operativos</td>
                <td class="right">${formatCurrency(currentData.totalExpenses)}</td>
                <td class="right">${currentData.totalIncome > 0 ? ((currentData.totalExpenses / currentData.totalIncome) * 100).toFixed(1) : 0}%</td>
              </tr>
              
              <tr class="grand-total">
                <td>UTILIDAD NETA</td>
                <td class="right ${currentData.netIncome >= 0 ? 'positive' : 'negative'}">${formatCurrency(currentData.netIncome)}</td>
                <td class="right">${currentData.totalIncome > 0 ? ((currentData.netIncome / currentData.totalIncome) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>
          
          <div class="signature-section">
            <div class="signature-box"><div class="signature-line">Elaborado por</div></div>
            <div class="signature-box"><div class="signature-line">Revisado por</div></div>
            <div class="signature-box"><div class="signature-line">Autorizado por</div></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const headers = ["Concepto", "Monto", "% del Total"];
    const rows = [];
    
    rows.push(["INGRESOS", "", ""]);
    currentData.income.forEach((item) => {
      const pct = currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0;
      rows.push([item.name, item.amount.toFixed(2), `${pct}%`]);
    });
    rows.push(["Total Ingresos", currentData.totalIncome.toFixed(2), "100%"]);
    rows.push(["", "", ""]);
    
    rows.push(["GASTOS OPERATIVOS", "", ""]);
    currentData.expenses.forEach((item) => {
      const pct = currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0;
      rows.push([item.name, item.amount.toFixed(2), `${pct}%`]);
    });
    const expPct = currentData.totalIncome > 0 ? ((currentData.totalExpenses / currentData.totalIncome) * 100).toFixed(1) : 0;
    rows.push(["Total Gastos", currentData.totalExpenses.toFixed(2), `${expPct}%`]);
    rows.push(["", "", ""]);
    
    const netPct = currentData.totalIncome > 0 ? ((currentData.netIncome / currentData.totalIncome) * 100).toFixed(1) : 0;
    rows.push(["UTILIDAD NETA", currentData.netIncome.toFixed(2), `${netPct}%`]);

    const csvContent = [
      `Estado de Resultados - ${orgName}`,
      `Periodo: ${periodLabel}`,
      `Fecha: ${new Date().toLocaleDateString("es-NI")}`,
      "",
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `estado_resultados_${selectedMonth || selectedYear}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Estado de Resultados (P&L)</h3>
          <p className="text-xs text-slate-500">Ingresos, gastos y utilidad del periodo</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="month">Mensual</option>
            <option value="quarter">Trimestral</option>
            <option value="year">Anual</option>
          </select>
          {selectedPeriod === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            />
          )}
          {selectedPeriod !== "month" && (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          )}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
          >
            Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800"
          >
            Imprimir
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={compareWithPrevious}
            onChange={(e) => setCompareWithPrevious(e.target.checked)}
            className="rounded"
          />
          Comparar con periodo anterior
        </label>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Ingresos Totales</p>
          <p className="text-xl font-bold text-emerald-600">{formatCurrency(currentData.totalIncome)}</p>
          {previousData && (
            <p className={`text-xs ${calculateVariance(currentData.totalIncome, previousData.totalIncome) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {calculateVariance(currentData.totalIncome, previousData.totalIncome)?.toFixed(1)}% vs anterior
            </p>
          )}
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Gastos Totales</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(currentData.totalExpenses)}</p>
          {previousData && (
            <p className={`text-xs ${calculateVariance(currentData.totalExpenses, previousData.totalExpenses) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {calculateVariance(currentData.totalExpenses, previousData.totalExpenses)?.toFixed(1)}% vs anterior
            </p>
          )}
        </div>
        <div className={`${currentData.netIncome >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} border rounded-lg p-4`}>
          <p className="text-xs text-slate-500">Utilidad Neta</p>
          <p className={`text-xl font-bold ${currentData.netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}>
            {formatCurrency(currentData.netIncome)}
          </p>
          {previousData && (
            <p className={`text-xs ${calculateVariance(currentData.netIncome, previousData.netIncome) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {calculateVariance(currentData.netIncome, previousData.netIncome)?.toFixed(1)}% vs anterior
            </p>
          )}
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-xs text-slate-500">Margen Neto</p>
          <p className="text-xl font-bold text-purple-600">
            {currentData.totalIncome > 0 ? ((currentData.netIncome / currentData.totalIncome) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>

      {/* Income Section */}
      <div className="border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-emerald-50 border-b">
          <h4 className="text-sm font-semibold text-emerald-700">INGRESOS</h4>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-600">
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-right">Monto</th>
              <th className="px-4 py-2 text-right">% del Total</th>
              {compareWithPrevious && previousData && (
                <>
                  <th className="px-4 py-2 text-right">Anterior</th>
                  <th className="px-4 py-2 text-right">Variacion</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.income.length === 0 ? (
              <tr>
                <td colSpan={compareWithPrevious ? 5 : 3} className="px-4 py-4 text-center text-slate-400">
                  No hay ingresos en este periodo
                </td>
              </tr>
            ) : (
              currentData.income.map((item, idx) => {
                const prevItem = previousData?.income.find((i) => i.name === item.name);
                const variance = calculateVariance(item.amount, prevItem?.amount);
                return (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0}%
                    </td>
                    {compareWithPrevious && previousData && (
                      <>
                        <td className="px-4 py-2 text-right text-slate-500">
                          {formatCurrency(prevItem?.amount || 0)}
                        </td>
                        <td className={`px-4 py-2 text-right ${variance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {variance !== null ? `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%` : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-emerald-100 font-semibold">
              <td className="px-4 py-2">Total Ingresos</td>
              <td className="px-4 py-2 text-right">{formatCurrency(currentData.totalIncome)}</td>
              <td className="px-4 py-2 text-right">100%</td>
              {compareWithPrevious && previousData && (
                <>
                  <td className="px-4 py-2 text-right">{formatCurrency(previousData.totalIncome)}</td>
                  <td className={`px-4 py-2 text-right ${calculateVariance(currentData.totalIncome, previousData.totalIncome) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {calculateVariance(currentData.totalIncome, previousData.totalIncome)?.toFixed(1)}%
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Expenses Section */}
      <div className="border rounded-lg overflow-hidden">
        <div className="px-4 py-3 bg-red-50 border-b">
          <h4 className="text-sm font-semibold text-red-700">GASTOS OPERATIVOS</h4>
        </div>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b text-xs uppercase text-slate-600">
              <th className="px-4 py-2 text-left">Categoria</th>
              <th className="px-4 py-2 text-right">Monto</th>
              <th className="px-4 py-2 text-right">% de Ingresos</th>
              {compareWithPrevious && previousData && (
                <>
                  <th className="px-4 py-2 text-right">Anterior</th>
                  <th className="px-4 py-2 text-right">Variacion</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {currentData.expenses.length === 0 ? (
              <tr>
                <td colSpan={compareWithPrevious ? 5 : 3} className="px-4 py-4 text-center text-slate-400">
                  No hay gastos en este periodo
                </td>
              </tr>
            ) : (
              currentData.expenses.map((item, idx) => {
                const prevItem = previousData?.expenses.find((e) => e.name === item.name);
                const variance = calculateVariance(item.amount, prevItem?.amount);
                return (
                  <tr key={idx} className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2 text-right font-medium">{formatCurrency(item.amount)}</td>
                    <td className="px-4 py-2 text-right text-slate-500">
                      {currentData.totalIncome > 0 ? ((item.amount / currentData.totalIncome) * 100).toFixed(1) : 0}%
                    </td>
                    {compareWithPrevious && previousData && (
                      <>
                        <td className="px-4 py-2 text-right text-slate-500">
                          {formatCurrency(prevItem?.amount || 0)}
                        </td>
                        <td className={`px-4 py-2 text-right ${variance <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {variance !== null ? `${variance >= 0 ? "+" : ""}${variance.toFixed(1)}%` : "—"}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          <tfoot>
            <tr className="bg-red-100 font-semibold">
              <td className="px-4 py-2">Total Gastos</td>
              <td className="px-4 py-2 text-right">{formatCurrency(currentData.totalExpenses)}</td>
              <td className="px-4 py-2 text-right">
                {currentData.totalIncome > 0 ? ((currentData.totalExpenses / currentData.totalIncome) * 100).toFixed(1) : 0}%
              </td>
              {compareWithPrevious && previousData && (
                <>
                  <td className="px-4 py-2 text-right">{formatCurrency(previousData.totalExpenses)}</td>
                  <td className={`px-4 py-2 text-right ${calculateVariance(currentData.totalExpenses, previousData.totalExpenses) <= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {calculateVariance(currentData.totalExpenses, previousData.totalExpenses)?.toFixed(1)}%
                  </td>
                </>
              )}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Net Income */}
      <div className={`border rounded-lg p-4 ${currentData.netIncome >= 0 ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"}`}>
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-bold text-slate-700">UTILIDAD NETA</h4>
            <p className="text-xs text-slate-500">Ingresos - Gastos = Resultado del periodo</p>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-bold ${currentData.netIncome >= 0 ? "text-blue-600" : "text-orange-600"}`}>
              {formatCurrency(currentData.netIncome)}
            </p>
            <p className="text-sm text-slate-500">
              Margen: {currentData.totalIncome > 0 ? ((currentData.netIncome / currentData.totalIncome) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}