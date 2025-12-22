"use client";

import React, { useState, useMemo } from "react";

export default function BalanceSheet({ 
  accounts, 
  assets, 
  receivables, 
  payables,
  sales = [],
  expenses = [],
  orgName = "Mi Empresa" 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showDetails, setShowDetails] = useState(true);

  const formatCurrency = (amount) => {
    return `C$ ${(amount || 0).toLocaleString("es-NI", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const balanceData = useMemo(() => {
    const asOfDate = new Date(selectedDate);

    // Calculate net income from sales data if available
    const useSalesData = sales && sales.length > 0;
    let periodNetIncome = 0;
    let totalSalesRevenue = 0;
    let totalCOGS = 0;
    let totalExpensesAmount = 0;
    
    if (useSalesData) {
      // Calculate revenue from sales (exclude canceled/refunded)
      const validSales = (sales || []).filter((s) => {
        if (s.status === "canceled" || s.status === "refunded") return false;
        const saleDate = new Date(s.fecha);
        return saleDate <= asOfDate;
      });
      
      totalSalesRevenue = validSales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
      
      // Calculate COGS from sales_items
      validSales.forEach((s) => {
        if (s.sales_items && Array.isArray(s.sales_items)) {
          s.sales_items.forEach((item) => {
            totalCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
          });
        }
      });
      
      // Calculate total expenses up to selected date
      const validExpenses = (expenses || []).filter((e) => {
        const expenseDate = new Date(e.date);
        return expenseDate <= asOfDate;
      });
      totalExpensesAmount = validExpenses.reduce((sum, e) => sum + (e.total || 0), 0);
      
      // Net income = Revenue - COGS - Expenses
      periodNetIncome = totalSalesRevenue - totalCOGS - totalExpensesAmount;
    }

    // ACTIVOS
    // Activos Corrientes
    const cashAccounts = (accounts || []).filter(
      (a) => a.type === "asset" && (a.subtype === "cash" || a.subtype === "bank")
    );
    let totalCash = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    const accountsReceivable = (receivables || [])
      .filter((r) => r.status !== "paid")
      .reduce((sum, r) => sum + ((r.total || 0) - (r.amount_paid || 0)), 0);

    const inventoryAccounts = (accounts || []).filter(
      (a) => a.type === "asset" && a.subtype === "inventory"
    );
    const totalInventory = inventoryAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    const otherCurrentAssets = (accounts || []).filter(
      (a) => a.type === "asset" && a.subtype === "current" && a.subtype !== "cash" && a.subtype !== "bank" && a.subtype !== "inventory"
    );
    const totalOtherCurrent = otherCurrentAssets.reduce((sum, a) => sum + (a.balance || 0), 0);

    // Activos Fijos
    const fixedAssets = (assets || []).map((a) => ({
      name: a.name,
      acquisitionCost: a.acquisition_cost || 0,
      accumulatedDepreciation: a.accumulated_depreciation || 0,
      netValue: (a.acquisition_cost || 0) - (a.accumulated_depreciation || 0),
    }));
    const totalFixedAssetsGross = fixedAssets.reduce((sum, a) => sum + a.acquisitionCost, 0);
    const totalAccumulatedDepreciation = fixedAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
    const totalFixedAssetsNet = totalFixedAssetsGross - totalAccumulatedDepreciation;

    // Otros Activos
    const otherAssets = (accounts || []).filter(
      (a) => a.type === "asset" && a.subtype === "other"
    );
    const totalOtherAssets = otherAssets.reduce((sum, a) => sum + (a.balance || 0), 0);

    // PASIVOS
    // Pasivos Corrientes
    const accountsPayable = (payables || [])
      .filter((p) => p.status !== "paid")
      .reduce((sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)), 0);

    const shortTermLiabilities = (accounts || []).filter(
      (a) => a.type === "liability" && a.subtype === "current"
    );
    const totalShortTermLiabilities = shortTermLiabilities.reduce((sum, a) => sum + (a.balance || 0), 0);

    const totalCurrentLiabilities = accountsPayable + totalShortTermLiabilities;

    // Pasivos a Largo Plazo
    const longTermLiabilities = (accounts || []).filter(
      (a) => a.type === "liability" && a.subtype === "long_term"
    );
    const totalLongTermLiabilities = longTermLiabilities.reduce((sum, a) => sum + (a.balance || 0), 0);

    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities;

    // PATRIMONIO
    const equityAccounts = (accounts || []).filter((a) => a.type === "equity");
    const totalEquity = equityAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    // AUTO-BALANCE: If using sales data and cash accounts are empty, estimate cash from sales
    // This makes the balance sheet useful even without full chart of accounts setup
    let estimatedCash = 0;
    let usingEstimatedCash = false;
    
    if (useSalesData && totalCash === 0 && cashAccounts.length === 0) {
      // Estimate cash = Sales Revenue - COGS - Expenses - Accounts Receivable (credit sales)
      // This assumes most sales are cash sales
      estimatedCash = totalSalesRevenue - totalCOGS - totalExpensesAmount - accountsReceivable;
      if (estimatedCash < 0) estimatedCash = 0; // Can't have negative cash
      totalCash = estimatedCash;
      usingEstimatedCash = true;
    }

    const totalCurrentAssets = totalCash + accountsReceivable + totalInventory + totalOtherCurrent;
    const totalAssets = totalCurrentAssets + totalFixedAssetsNet + totalOtherAssets;

    // Utilidades Retenidas - use calculated net income from sales if available
    // Otherwise calculate as difference to balance
    const retainedEarnings = useSalesData 
      ? periodNetIncome 
      : (totalAssets - totalLiabilities - totalEquity);

    const totalEquityWithRetained = totalEquity + retainedEarnings;
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquityWithRetained;

    // Verificar que cuadre
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

    return {
      // Activos
      currentAssets: {
        cash: { 
          label: usingEstimatedCash ? "Efectivo (Estimado de Ventas)" : "Efectivo y Bancos", 
          amount: totalCash, 
          items: cashAccounts,
          isEstimated: usingEstimatedCash,
        },
        receivables: { label: "Cuentas por Cobrar", amount: accountsReceivable },
        inventory: { label: "Inventarios", amount: totalInventory, items: inventoryAccounts },
        other: { label: "Otros Activos Corrientes", amount: totalOtherCurrent, items: otherCurrentAssets },
        total: totalCurrentAssets,
      },
      fixedAssets: {
        items: fixedAssets,
        grossValue: totalFixedAssetsGross,
        depreciation: totalAccumulatedDepreciation,
        netValue: totalFixedAssetsNet,
      },
      otherAssets: {
        items: otherAssets,
        total: totalOtherAssets,
      },
      totalAssets,

      // Pasivos
      currentLiabilities: {
        payables: { label: "Cuentas por Pagar", amount: accountsPayable },
        other: { label: "Otros Pasivos Corrientes", amount: totalShortTermLiabilities, items: shortTermLiabilities },
        total: totalCurrentLiabilities,
      },
      longTermLiabilities: {
        items: longTermLiabilities,
        total: totalLongTermLiabilities,
      },
      totalLiabilities,

      // Patrimonio
      equity: {
        items: equityAccounts,
        capital: totalEquity,
        retainedEarnings,
        total: totalEquityWithRetained,
      },

      totalLiabilitiesAndEquity,
      isBalanced,
      usingSalesData: useSalesData,
      usingEstimatedCash,
      
      // Sales summary for info panel
      salesSummary: useSalesData ? {
        revenue: totalSalesRevenue,
        cogs: totalCOGS,
        expenses: totalExpensesAmount,
        netIncome: periodNetIncome,
      } : null,
    };
  }, [accounts, assets, receivables, payables, sales, expenses, selectedDate]);

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Balance General - ${selectedDate}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; font-size: 11px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18px; margin-bottom: 5px; }
            .header h2 { font-size: 14px; font-weight: normal; color: #555; }
            .columns { display: flex; gap: 20px; }
            .column { flex: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f5f5f5; font-weight: bold; }
            td.right { text-align: right; }
            td.indent { padding-left: 20px; }
            .section-header { background: #333; color: white; font-weight: bold; }
            .subsection-header { background: #e8e8e8; font-weight: bold; }
            .total-row { background: #f0f0f0; font-weight: bold; }
            .grand-total { background: #333; color: white; font-weight: bold; }
            .balanced { color: #059669; }
            .unbalanced { color: #dc2626; }
            .signature-section { margin-top: 50px; display: flex; justify-content: space-around; }
            .signature-box { text-align: center; width: 200px; }
            .signature-line { border-top: 1px solid #333; margin-top: 50px; padding-top: 5px; }
            @media print { @page { margin: 15mm; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${orgName}</h1>
            <h2>BALANCE GENERAL</h2>
            <p>Al ${new Date(selectedDate).toLocaleDateString("es-NI", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p>Generado: ${new Date().toLocaleDateString("es-NI")}</p>
          </div>
          
          <div class="columns">
            <div class="column">
              <table>
                <thead>
                  <tr class="section-header">
                    <th colspan="2">ACTIVOS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="subsection-header">
                    <td colspan="2">Activos Corrientes</td>
                  </tr>
                  <tr>
                    <td class="indent">Efectivo y Bancos</td>
                    <td class="right">${formatCurrency(balanceData.currentAssets.cash.amount)}</td>
                  </tr>
                  <tr>
                    <td class="indent">Cuentas por Cobrar</td>
                    <td class="right">${formatCurrency(balanceData.currentAssets.receivables.amount)}</td>
                  </tr>
                  <tr>
                    <td class="indent">Inventarios</td>
                    <td class="right">${formatCurrency(balanceData.currentAssets.inventory.amount)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Activos Corrientes</td>
                    <td class="right">${formatCurrency(balanceData.currentAssets.total)}</td>
                  </tr>
                  
                  <tr class="subsection-header">
                    <td colspan="2">Activos Fijos</td>
                  </tr>
                  <tr>
                    <td class="indent">Activos Fijos (Costo)</td>
                    <td class="right">${formatCurrency(balanceData.fixedAssets.grossValue)}</td>
                  </tr>
                  <tr>
                    <td class="indent">(-) Depreciacion Acumulada</td>
                    <td class="right">(${formatCurrency(balanceData.fixedAssets.depreciation)})</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Activos Fijos Neto</td>
                    <td class="right">${formatCurrency(balanceData.fixedAssets.netValue)}</td>
                  </tr>
                  
                  <tr class="grand-total">
                    <td>TOTAL ACTIVOS</td>
                    <td class="right">${formatCurrency(balanceData.totalAssets)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="column">
              <table>
                <thead>
                  <tr class="section-header">
                    <th colspan="2">PASIVOS Y PATRIMONIO</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="subsection-header">
                    <td colspan="2">Pasivos Corrientes</td>
                  </tr>
                  <tr>
                    <td class="indent">Cuentas por Pagar</td>
                    <td class="right">${formatCurrency(balanceData.currentLiabilities.payables.amount)}</td>
                  </tr>
                  <tr>
                    <td class="indent">Otros Pasivos Corrientes</td>
                    <td class="right">${formatCurrency(balanceData.currentLiabilities.other.amount)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Pasivos Corrientes</td>
                    <td class="right">${formatCurrency(balanceData.currentLiabilities.total)}</td>
                  </tr>
                  
                  <tr class="subsection-header">
                    <td colspan="2">Pasivos a Largo Plazo</td>
                  </tr>
                  <tr>
                    <td class="indent">Deudas a Largo Plazo</td>
                    <td class="right">${formatCurrency(balanceData.longTermLiabilities.total)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Pasivos</td>
                    <td class="right">${formatCurrency(balanceData.totalLiabilities)}</td>
                  </tr>
                  
                  <tr class="subsection-header">
                    <td colspan="2">Patrimonio</td>
                  </tr>
                  <tr>
                    <td class="indent">Capital Social</td>
                    <td class="right">${formatCurrency(balanceData.equity.capital)}</td>
                  </tr>
                  <tr>
                    <td class="indent">Utilidades Retenidas</td>
                    <td class="right">${formatCurrency(balanceData.equity.retainedEarnings)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Total Patrimonio</td>
                    <td class="right">${formatCurrency(balanceData.equity.total)}</td>
                  </tr>
                  
                  <tr class="grand-total">
                    <td>TOTAL PASIVOS + PATRIMONIO</td>
                    <td class="right">${formatCurrency(balanceData.totalLiabilitiesAndEquity)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <p style="text-align: center; margin-top: 20px; font-weight: bold;" class="${balanceData.isBalanced ? 'balanced' : 'unbalanced'}">
            ${balanceData.isBalanced ? 'Balance Cuadrado' : 'ADVERTENCIA: Balance No Cuadra'}
          </p>
          
          <div class="signature-section">
            <div class="signature-box"><div class="signature-line">Contador</div></div>
            <div class="signature-box"><div class="signature-line">Gerente General</div></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const rows = [];
    rows.push(["Balance General", ""]);
    rows.push([`Al ${new Date(selectedDate).toLocaleDateString("es-NI")}`, ""]);
    rows.push(["", ""]);
    
    rows.push(["ACTIVOS", ""]);
    rows.push(["Activos Corrientes", ""]);
    rows.push(["  Efectivo y Bancos", balanceData.currentAssets.cash.amount.toFixed(2)]);
    rows.push(["  Cuentas por Cobrar", balanceData.currentAssets.receivables.amount.toFixed(2)]);
    rows.push(["  Inventarios", balanceData.currentAssets.inventory.amount.toFixed(2)]);
    rows.push(["Total Activos Corrientes", balanceData.currentAssets.total.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["Activos Fijos", ""]);
    rows.push(["  Activos Fijos (Costo)", balanceData.fixedAssets.grossValue.toFixed(2)]);
    rows.push(["  (-) Depreciacion Acumulada", (-balanceData.fixedAssets.depreciation).toFixed(2)]);
    rows.push(["Total Activos Fijos Neto", balanceData.fixedAssets.netValue.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["TOTAL ACTIVOS", balanceData.totalAssets.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["PASIVOS", ""]);
    rows.push(["Pasivos Corrientes", ""]);
    rows.push(["  Cuentas por Pagar", balanceData.currentLiabilities.payables.amount.toFixed(2)]);
    rows.push(["  Otros Pasivos Corrientes", balanceData.currentLiabilities.other.amount.toFixed(2)]);
    rows.push(["Total Pasivos Corrientes", balanceData.currentLiabilities.total.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["Pasivos a Largo Plazo", balanceData.longTermLiabilities.total.toFixed(2)]);
    rows.push(["TOTAL PASIVOS", balanceData.totalLiabilities.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["PATRIMONIO", ""]);
    rows.push(["  Capital Social", balanceData.equity.capital.toFixed(2)]);
    rows.push(["  Utilidades Retenidas", balanceData.equity.retainedEarnings.toFixed(2)]);
    rows.push(["TOTAL PATRIMONIO", balanceData.equity.total.toFixed(2)]);
    rows.push(["", ""]);
    
    rows.push(["TOTAL PASIVOS + PATRIMONIO", balanceData.totalLiabilitiesAndEquity.toFixed(2)]);

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `balance_general_${selectedDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-700">Balance General</h3>
          <p className="text-xs text-slate-500">Activos, pasivos y patrimonio de la empresa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showDetails}
              onChange={(e) => setShowDetails(e.target.checked)}
              className="rounded"
            />
            Mostrar detalles
          </label>
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

      {/* Balance Status */}
      <div className={`p-3 rounded-lg text-center text-sm font-medium ${
        balanceData.isBalanced 
          ? "bg-emerald-50 border border-emerald-200 text-emerald-700" 
          : "bg-red-50 border border-red-200 text-red-700"
      }`}>
        {balanceData.isBalanced 
          ? "Balance Cuadrado - Activos = Pasivos + Patrimonio" 
          : "ADVERTENCIA: El balance no cuadra. Revise las cuentas."}
      </div>

      {/* Sales Summary Panel - shows when using sales data */}
      {balanceData.salesSummary && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            Resumen de Ventas (Base del Balance)
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-500">Ingresos por Ventas</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(balanceData.salesSummary.revenue)}</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-500">Costo de Ventas</p>
              <p className="text-lg font-bold text-red-600">({formatCurrency(balanceData.salesSummary.cogs)})</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-500">Gastos Operativos</p>
              <p className="text-lg font-bold text-orange-600">({formatCurrency(balanceData.salesSummary.expenses)})</p>
            </div>
            <div className="bg-white rounded-lg p-3 border">
              <p className="text-xs text-slate-500">Utilidad Neta</p>
              <p className={`text-lg font-bold ${balanceData.salesSummary.netIncome >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(balanceData.salesSummary.netIncome)}
              </p>
            </div>
          </div>
          {balanceData.usingEstimatedCash && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 p-2 rounded">
              Nota: El efectivo se estima automaticamente basado en las ventas menos costos y gastos. 
              Para mayor precision, configure las cuentas contables en el catalogo de cuentas.
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ACTIVOS */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-blue-600 text-white">
              <h4 className="font-semibold">ACTIVOS</h4>
            </div>
            
            {/* Activos Corrientes */}
            <div className="border-b">
              <div className="px-4 py-2 bg-blue-50 font-medium text-blue-700">
                Activos Corrientes
              </div>
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">
                      {balanceData.currentAssets.cash.label}
                      {balanceData.currentAssets.cash.isEstimated && (
                        <span className="ml-2 text-xs text-amber-600">(estimado)</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.currentAssets.cash.amount)}
                    </td>
                  </tr>
                  {showDetails && balanceData.currentAssets.cash.items?.map((item, idx) => (
                    <tr key={idx} className="border-b bg-slate-50 text-xs text-slate-500">
                      <td className="px-4 py-1 pl-12">{item.name}</td>
                      <td className="px-4 py-1 text-right">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Cuentas por Cobrar</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.currentAssets.receivables.amount)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Inventarios</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.currentAssets.inventory.amount)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-blue-100 font-semibold">
                    <td className="px-4 py-2">Total Activos Corrientes</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.currentAssets.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Activos Fijos */}
            <div className="border-b">
              <div className="px-4 py-2 bg-blue-50 font-medium text-blue-700">
                Activos Fijos
              </div>
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Activos Fijos (Costo)</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.fixedAssets.grossValue)}
                    </td>
                  </tr>
                  {showDetails && balanceData.fixedAssets.items?.map((item, idx) => (
                    <tr key={idx} className="border-b bg-slate-50 text-xs text-slate-500">
                      <td className="px-4 py-1 pl-12">{item.name}</td>
                      <td className="px-4 py-1 text-right">{formatCurrency(item.acquisitionCost)}</td>
                    </tr>
                  ))}
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8 text-red-600">(-) Depreciacion Acumulada</td>
                    <td className="px-4 py-2 text-right font-medium text-red-600">
                      ({formatCurrency(balanceData.fixedAssets.depreciation)})
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-blue-100 font-semibold">
                    <td className="px-4 py-2">Total Activos Fijos Neto</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.fixedAssets.netValue)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total Activos */}
            <div className="px-4 py-3 bg-blue-600 text-white font-bold flex justify-between">
              <span>TOTAL ACTIVOS</span>
              <span>{formatCurrency(balanceData.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* PASIVOS Y PATRIMONIO */}
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-red-600 text-white">
              <h4 className="font-semibold">PASIVOS</h4>
            </div>
            
            {/* Pasivos Corrientes */}
            <div className="border-b">
              <div className="px-4 py-2 bg-red-50 font-medium text-red-700">
                Pasivos Corrientes
              </div>
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Cuentas por Pagar</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.currentLiabilities.payables.amount)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Otros Pasivos Corrientes</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.currentLiabilities.other.amount)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-red-100 font-semibold">
                    <td className="px-4 py-2">Total Pasivos Corrientes</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.currentLiabilities.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Pasivos a Largo Plazo */}
            <div className="border-b">
              <div className="px-4 py-2 bg-red-50 font-medium text-red-700">
                Pasivos a Largo Plazo
              </div>
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Deudas a Largo Plazo</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.longTermLiabilities.total)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-red-100 font-semibold">
                    <td className="px-4 py-2">Total Pasivos</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.totalLiabilities)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Patrimonio */}
            <div className="px-4 py-3 bg-purple-600 text-white">
              <h4 className="font-semibold">PATRIMONIO</h4>
            </div>
            <div className="border-b">
              <table className="min-w-full text-sm">
                <tbody>
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Capital Social</td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(balanceData.equity.capital)}
                    </td>
                  </tr>
                  {showDetails && balanceData.equity.items?.map((item, idx) => (
                    <tr key={idx} className="border-b bg-slate-50 text-xs text-slate-500">
                      <td className="px-4 py-1 pl-12">{item.name}</td>
                      <td className="px-4 py-1 text-right">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                  <tr className="border-b hover:bg-slate-50">
                    <td className="px-4 py-2 pl-8">Utilidades Retenidas</td>
                    <td className={`px-4 py-2 text-right font-medium ${balanceData.equity.retainedEarnings >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(balanceData.equity.retainedEarnings)}
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-purple-100 font-semibold">
                    <td className="px-4 py-2">Total Patrimonio</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(balanceData.equity.total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Total Pasivos + Patrimonio */}
            <div className="px-4 py-3 bg-slate-800 text-white font-bold flex justify-between">
              <span>TOTAL PASIVOS + PATRIMONIO</span>
              <span>{formatCurrency(balanceData.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Ratios */}
      <div className="border rounded-lg p-4 bg-slate-50">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Indicadores Financieros</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-slate-500">Razon Corriente</p>
            <p className="text-lg font-bold text-blue-600">
              {balanceData.currentLiabilities.total > 0 
                ? (balanceData.currentAssets.total / balanceData.currentLiabilities.total).toFixed(2)
                : "N/A"}
            </p>
            <p className="text-xs text-slate-400">Activo Corriente / Pasivo Corriente</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-slate-500">Prueba Acida</p>
            <p className="text-lg font-bold text-purple-600">
              {balanceData.currentLiabilities.total > 0 
                ? ((balanceData.currentAssets.total - balanceData.currentAssets.inventory.amount) / balanceData.currentLiabilities.total).toFixed(2)
                : "N/A"}
            </p>
            <p className="text-xs text-slate-400">(AC - Inventario) / PC</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-slate-500">Endeudamiento</p>
            <p className="text-lg font-bold text-red-600">
              {balanceData.totalAssets > 0 
                ? ((balanceData.totalLiabilities / balanceData.totalAssets) * 100).toFixed(1)
                : 0}%
            </p>
            <p className="text-xs text-slate-400">Pasivos / Activos</p>
          </div>
          <div className="bg-white rounded-lg p-3 border">
            <p className="text-xs text-slate-500">Capital de Trabajo</p>
            <p className={`text-lg font-bold ${(balanceData.currentAssets.total - balanceData.currentLiabilities.total) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(balanceData.currentAssets.total - balanceData.currentLiabilities.total)}
            </p>
            <p className="text-xs text-slate-400">AC - PC</p>
          </div>
        </div>
      </div>
    </div>
  );
}