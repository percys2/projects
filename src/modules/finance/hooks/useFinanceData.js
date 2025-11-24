import { useState, useEffect } from "react";

export function useFinanceData(orgSlug) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`/api/finance?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        calculateSummary(data.transactions || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (transactionsList) => {
    const income = transactionsList
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const expenses = transactionsList
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    setSummary({
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: income - expenses,
      transactionCount: transactionsList.length,
    });
  };

  const addTransaction = async (transactionData) => {
    try {
      const response = await fetch(`/api/finance?slug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        await fetchTransactions();
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await fetch(`/api/finance?slug=${orgSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...transactionData }),
      });

      if (response.ok) {
        await fetchTransactions();
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      const response = await fetch(`/api/finance?slug=${orgSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchTransactions();
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  useEffect(() => {
    if (orgSlug) {
      fetchTransactions();
    }
  }, [orgSlug]);

  return {
    transactions,
    summary,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refreshData: fetchTransactions,
  };
}
