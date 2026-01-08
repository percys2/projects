import { useMemo } from "react";

export function useBalanceSheet({ sales, expenses, accounts, inventory, assets, payables, receivables }) {
  
  const balanceData = useMemo(() => {
    // Filter valid sales
    const validSales = (sales || []).filter(
      (s) => s.status !== "canceled" && s.status !== "refunded"
    );
    
    // Calculate sales metrics
    const totalRevenue = validSales.reduce((sum, s) => sum + (parseFloat(s.total) || 0), 0);
    let totalCOGS = 0;
    validSales.forEach((s) => {
      if (s.sales_items && Array.isArray(s.sales_items)) {
        s.sales_items.forEach((item) => {
          totalCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
        });
      }
    });

    // Calculate expenses
    const validExpenses = (expenses || []).filter((e) => e.total > 0);
    const totalExpenses = validExpenses.reduce((sum, e) => sum + (e.total || 0), 0);

    // Cash accounts
    const cashAccounts = (accounts || []).filter(
      (a) => a.type === "asset" && (a.subtype === "cash" || a.subtype === "bank")
    );
    const totalCash = cashAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);

    // Receivables
    const accountsReceivable = (receivables || [])
      .filter((r) => r.status !== "paid")
      .reduce((sum, r) => sum + ((r.total || 0) - (r.amount_paid || 0)), 0);

    // Inventory value
    const inventoryValue = (inventory || []).reduce(
      (sum, i) => sum + ((i.quantity || 0) * (i.cost || i.products?.cost || 0)),
      0
    );

    // Fixed assets
    const fixedAssetsList = (assets || []).filter((a) => a.status === "active");
    const fixedAssetsGross = fixedAssetsList.reduce((sum, a) => sum + (a.acquisition_cost || 0), 0);
    const depreciation = fixedAssetsList.reduce((sum, a) => sum + (a.accumulated_depreciation || 0), 0);
    const fixedAssetsNet = fixedAssetsGross - depreciation;

    // Payables
    const accountsPayable = (payables || [])
      .filter((p) => p.status !== "paid")
      .reduce((sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)), 0);

    // Calculate totals
    const estimatedCash = totalCash > 0 ? totalCash : Math.max(0, totalRevenue - totalCOGS - totalExpenses);
    const usingEstimatedCash = totalCash === 0 && estimatedCash > 0;

    const currentAssetsTotal = estimatedCash + accountsReceivable + inventoryValue;
    const totalAssets = currentAssetsTotal + fixedAssetsNet;

    const currentLiabilitiesTotal = accountsPayable;
    const totalLiabilities = currentLiabilitiesTotal;

    const retainedEarnings = totalRevenue - totalCOGS - totalExpenses;
    const capitalAccounts = (accounts || []).filter((a) => a.type === "equity");
    const capital = capitalAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalEquity = capital + retainedEarnings;

    return {
      currentAssets: {
        cash: { amount: estimatedCash, isEstimated: usingEstimatedCash, label: "Efectivo y Equivalentes", items: cashAccounts },
        receivables: { amount: accountsReceivable },
        inventory: { amount: inventoryValue },
        total: currentAssetsTotal,
      },
      fixedAssets: {
        grossValue: fixedAssetsGross,
        depreciation,
        netValue: fixedAssetsNet,
        items: fixedAssetsList,
      },
      totalAssets,
      currentLiabilities: {
        payables: { amount: accountsPayable },
        other: { amount: 0 },
        total: currentLiabilitiesTotal,
      },
      longTermLiabilities: { total: 0 },
      totalLiabilities,
      equity: {
        capital,
        retainedEarnings,
        total: totalEquity,
        items: capitalAccounts,
      },
      totalLiabilitiesAndEquity: totalLiabilities + totalEquity,
      salesSummary: {
        revenue: totalRevenue,
        cogs: totalCOGS,
        expenses: totalExpenses,
        netIncome: retainedEarnings,
      },
      usingEstimatedCash,
    };
  }, [sales, expenses, accounts, inventory, assets, payables, receivables]);

  return { balanceData };
}
