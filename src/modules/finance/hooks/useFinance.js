"use client";

import { useEffect, useState, useMemo } from "react";

// Helper function to get month key (YYYY-MM) from various date formats
function getMonthKey(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a string in YYYY-MM-DD format
  if (typeof dateValue === "string") {
    // Check for ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
      return dateValue.slice(0, 7);
    }
    // Check for DD/MM/YYYY or DD-MM-YYYY format
    const match = dateValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (match) {
      const month = match[2].padStart(2, "0");
      const year = match[3];
      return `${year}-${month}`;
    }
  }
  
  // Fallback: try to parse as Date
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }
  
  return null;
}

// Helper to safely parse amount (handles strings with commas)
function parseAmount(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    // Remove commas and parse
    return parseFloat(value.replace(/,/g, "")) || 0;
  }
  return 0;
}

export function useFinance(orgSlug) {
    const [accounts, setAccounts] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [assets, setAssets] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [clients, setClients] = useState([]);
    const [receivables, setReceivables] = useState([]);
    const [payables, setPayables] = useState([]);
    const [sales, setSales] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [payingBill, setPayingBill] = useState(null);

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [receivableModalOpen, setReceivableModalOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState(null);

  const [payableModalOpen, setPayableModalOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState(null);

  async function loadData() {
    try {
      setLoading(true);
      const headers = { "x-org-slug": orgSlug };

            const [
              accountsRes,
              expensesRes,
              paymentsRes,
              assetsRes,
              suppliersRes,
              clientsRes,
              receivablesRes,
              payablesRes,
              salesRes,
              inventoryRes,
            ] = await Promise.all([
              fetch("/api/finance/accounts", { headers }),
              fetch("/api/finance/ap-bills", { headers }),
              fetch("/api/finance/payments", { headers }),
              fetch("/api/finance/assets", { headers }),
              fetch("/api/finance/suppliers", { headers }),
              fetch("/api/clients", { headers }),
              fetch("/api/finance/receivables", { headers }),
              fetch("/api/finance/reports/payables", { headers }),
              fetch("/api/sales?limit=1000", { headers }),
              fetch("/api/inventory", { headers }),
            ]);

            const [
              accountsData,
              expensesData,
              paymentsData,
              assetsData,
              suppliersData,
              clientsData,
              receivablesData,
              payablesData,
              salesData,
              inventoryData,
            ] = await Promise.all([
              accountsRes.json(),
              expensesRes.json(),
              paymentsRes.json(),
              assetsRes.json(),
              suppliersRes.json(),
              clientsRes.json(),
              receivablesRes.json(),
              payablesRes.json(),
              salesRes.json(),
              inventoryRes.json(),
            ]);

            setAccounts(accountsData.accounts || []);
            setExpenses(expensesData.bills || []);
            setPayments(paymentsData.payments || []);
            setAssets(assetsData.assets || []);
            setSuppliers(suppliersData.suppliers || []);
            setClients(Array.isArray(clientsData) ? clientsData : (clientsData.clients || []));
            setReceivables(receivablesData.receivables || []);
            setPayables(payablesData.payables || []);
            setSales(salesData.sales || []);
            setInventory(Array.isArray(inventoryData) ? inventoryData : (inventoryData.products || inventoryData.inventory || []));
    } catch (err) {
      console.error("Finance fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orgSlug) loadData();
  }, [orgSlug]);

  const stats = useMemo(() => {
    const totalReceivables = receivables.reduce(
      (sum, r) => sum + ((r.total || 0) - (r.amount_paid || 0)),
      0
    );
    const totalPayables = payables.reduce(
      (sum, p) => sum + ((p.total || 0) - (p.amount_paid || 0)),
      0
    );
    const totalAssets = assets.reduce(
      (sum, a) => sum + (a.acquisition_cost || 0),
      0
    );
    
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Use getMonthKey for robust date parsing (handles YYYY-MM-DD and DD/MM/YYYY formats)
    const monthlyExpenses = expenses
      .filter((e) => getMonthKey(e.date) === currentMonthKey)
      .reduce((sum, e) => sum + parseAmount(e.total), 0);

    const cashIn = payments
      .filter((p) => p.direction === "in")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const cashOut = payments
      .filter((p) => p.direction === "out")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const validSales = (sales || []).filter(
      (s) => s.status !== "canceled" && s.status !== "refunded"
    );
    
    // Use getMonthKey for robust date parsing of sales
    const monthlySales = validSales.filter((s) => getMonthKey(s.created_at || s.fecha) === currentMonthKey);
    
    const monthlyIncome = monthlySales.reduce(
      (sum, s) => sum + (parseFloat(s.total) || 0),
      0
    );
    
    let monthlyCOGS = 0;
    monthlySales.forEach((s) => {
      if (s.sales_items && Array.isArray(s.sales_items)) {
        s.sales_items.forEach((item) => {
          monthlyCOGS += (parseFloat(item.cost) || 0) * (parseInt(item.quantity) || 0);
        });
      }
    });
    
    const monthlyGrossProfit = monthlyIncome - monthlyCOGS;
    const monthlyNetProfit = monthlyGrossProfit - monthlyExpenses;
    const netCashFlow = monthlyGrossProfit - monthlyExpenses;

    return {
      totalReceivables,
      totalPayables,
      totalAssets,
      monthlyExpenses,
      monthlyIncome,
      monthlyCOGS,
      monthlyGrossProfit,
      monthlyNetProfit,
      cashIn,
      cashOut,
      netCashFlow,
    };
  }, [receivables, payables, assets, expenses, payments, sales]);

  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [payments]);

  const expenseAccounts = useMemo(() => {
    return accounts.filter((a) => a.type === "expense");
  }, [accounts]);

  const assetAccounts = useMemo(() => {
    return accounts.filter((a) => a.type === "asset" && a.subtype === "fixed_asset");
  }, [accounts]);

  const cashAccounts = useMemo(() => {
    return accounts.filter(
      (a) => a.type === "asset" && (a.subtype === "cash" || a.subtype === "bank")
    );
  }, [accounts]);

  function openNewAccount() {
    setEditingAccount(null);
    setAccountModalOpen(true);
  }

  function openEditAccount(account) {
    setEditingAccount(account);
    setAccountModalOpen(true);
  }

  function closeAccountModal() {
    setAccountModalOpen(false);
    setEditingAccount(null);
  }

  async function saveAccount(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/accounts", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar cuenta");

      await loadData();
      closeAccountModal();
      return { success: true };
    } catch (err) {
      console.error("Save account error:", err);
      return { success: false, error: err.message };
    }
  }

  async function deleteAccount(id) {
    if (!window.confirm("¿Eliminar esta cuenta contable?")) return;
    try {
      const res = await fetch("/api/finance/accounts", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error al eliminar cuenta");

      await loadData();
      return { success: true };
    } catch (err) {
      console.error("Delete account error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  function openNewExpense() {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  }

  function openEditExpense(expense) {
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  }

  function closeExpenseModal() {
    setExpenseModalOpen(false);
    setEditingExpense(null);
  }

  async function saveExpense(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/ap-bills", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar gasto");

      await loadData();
      closeExpenseModal();
      return { success: true };
    } catch (err) {
      console.error("Save expense error:", err);
      return { success: false, error: err.message };
    }
  }

  async function deleteExpense(id) {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    try {
      const res = await fetch("/api/finance/ap-bills", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error al eliminar gasto");

      await loadData();
      return { success: true };
    } catch (err) {
      console.error("Delete expense error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  function openNewPayment() {
    setEditingPayment(null);
    setPayingBill(null);
    setPaymentModalOpen(true);
  }

  function openEditPayment(payment) {
    setEditingPayment(payment);
    setPayingBill(null);
    setPaymentModalOpen(true);
  }

  function openPayBill(bill) {
    setEditingPayment(null);
    setPayingBill(bill);
    setPaymentModalOpen(true);
  }

  function closePaymentModal() {
    setPaymentModalOpen(false);
    setEditingPayment(null);
    setPayingBill(null);
  }

  async function savePayment(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/payments", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar pago");

      await loadData();
      closePaymentModal();
      return { success: true };
    } catch (err) {
      console.error("Save payment error:", err);
      return { success: false, error: err.message };
    }
  }

  async function deletePayment(id) {
    if (!window.confirm("¿Eliminar este pago/cobro?")) return;
    try {
      const res = await fetch("/api/finance/payments", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error al eliminar pago");

      await loadData();
      return { success: true };
    } catch (err) {
      console.error("Delete payment error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  function openNewAsset() {
    setEditingAsset(null);
    setAssetModalOpen(true);
  }

  function openEditAsset(asset) {
    setEditingAsset(asset);
    setAssetModalOpen(true);
  }

  function closeAssetModal() {
    setAssetModalOpen(false);
    setEditingAsset(null);
  }

  async function saveAsset(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/assets", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al guardar activo");

      await loadData();
      closeAssetModal();
      return { success: true };
    } catch (err) {
      console.error("Save asset error:", err);
      return { success: false, error: err.message };
    }
  }

  async function deleteAsset(id) {
    if (!window.confirm("¿Eliminar este activo fijo?")) return;
    try {
      const res = await fetch("/api/finance/assets", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error al eliminar activo");

      await loadData();
      return { success: true };
    } catch (err) {
      console.error("Delete asset error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  function openNewSupplier() {
    setEditingSupplier(null);
    setSupplierModalOpen(true);
  }

  function openEditSupplier(supplier) {
    setEditingSupplier(supplier);
    setSupplierModalOpen(true);
  }

  function closeSupplierModal() {
    setSupplierModalOpen(false);
    setEditingSupplier(null);
  }

  async function saveSupplier(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/suppliers", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || "Error al guardar proveedor");
    }

      await loadData();
      closeSupplierModal();
      return { success: true };
    } catch (err) {
      console.error("Save supplier error:", err);
      return { success: false, error: err.message };
    }
  }

  async function createSupplierInline(data) {
    try {
      const res = await fetch("/api/finance/suppliers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al crear proveedor");

      const result = await res.json();
      await loadData();
      return { success: true, supplier: result.supplier };
    } catch (err) {
      console.error("Create supplier inline error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  async function deleteSupplier(id) {
    if (!window.confirm("¿Eliminar este proveedor?")) return;
    try {
      const res = await fetch("/api/finance/suppliers", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Error al eliminar proveedor");

      await loadData();
      return { success: true };
    } catch (err) {
      console.error("Delete supplier error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  async function createClientInline(data) {
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Error al crear cliente");

      const client = await res.json();
      await loadData();
      return { success: true, client };
    } catch (err) {
      console.error("Create client inline error:", err);
      alert(err.message);
      return { success: false, error: err.message };
    }
  }

  function openReceivableModal() {
    setEditingReceivable(null);
    setReceivableModalOpen(true);
  }

  function openEditReceivable(receivable) {
    setEditingReceivable(receivable);
    setReceivableModalOpen(true);
  }

  function closeReceivableModal() {
    setReceivableModalOpen(false);
    setEditingReceivable(null);
  }

    async function saveReceivable(data) {
      try {
        const method = data.id ? "PUT" : "POST";
        const res = await fetch("/api/finance/receivables", {
          method,
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify(data),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || "Error al guardar cuenta por cobrar");
        }
        await loadData();
        closeReceivableModal();
        return { success: true };
      } catch (err) {
        console.error("Save receivable error:", err);
        return { success: false, error: err.message };
      }
    }

    async function deleteReceivable(id) {
      if (!confirm("¿Está seguro de eliminar esta cuenta por cobrar?")) return;
      try {
        const res = await fetch("/api/finance/receivables", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-org-slug": orgSlug,
          },
          body: JSON.stringify({ id }),
        });
        if (!res.ok) throw new Error("Error al eliminar cuenta por cobrar");
        await loadData();
        return { success: true };
      } catch (err) {
        console.error("Delete receivable error:", err);
        return { success: false, error: err.message };
      }
    }

    function openPayableModal(){
    setEditingPayable(null);
    setPayableModalOpen(true);
  }

  function openEditPayable(payable) {
    setEditingPayable(payable);
    setPayableModalOpen(true);
  }

  function closePayableModal() {
    setPayableModalOpen(false);
    setEditingPayable(null);
  }

  async function savePayable(data) {
    try {
      const method = data.id ? "PUT" : "POST";
      const res = await fetch("/api/finance/payables", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Error al guardar cuenta por pagar");
      await loadData();
      closePayableModal();
      return { success: true };
    } catch (err) {
      console.error("Save payable error:", err);
      return { success: false, error: err.message };
    }
  }

    return {
      accounts,
      expenses,
      payments,
      assets,
      suppliers,
      clients,
      receivables,
      payables,
      sales,
      inventory,
      loading,
      error,
      stats,
      recentPayments,
      expenseAccounts,
      assetAccounts,
      cashAccounts,

    accountModalOpen,
    editingAccount,
    openNewAccount,
    openEditAccount,
    closeAccountModal,
    saveAccount,
    deleteAccount,

    expenseModalOpen,
    editingExpense,
    openNewExpense,
    openEditExpense,
    closeExpenseModal,
    saveExpense,
    deleteExpense,

    paymentModalOpen,
    editingPayment,
    payingBill,
    openNewPayment,
    openEditPayment,
    openPayBill,
    closePaymentModal,
    savePayment,
    deletePayment,

    assetModalOpen,
    editingAsset,
    openNewAsset,
    openEditAsset,
    closeAssetModal,
    saveAsset,
    deleteAsset,

    supplierModalOpen,
    editingSupplier,
    openNewSupplier,
    openEditSupplier,
    closeSupplierModal,
    saveSupplier,
    createSupplierInline,
    deleteSupplier,

        createClientInline,

        receivableModalOpen,
        editingReceivable,
        openReceivableModal,
        openEditReceivable,
        closeReceivableModal,
        saveReceivable,
        deleteReceivable,

        payableModalOpen,
    editingPayable,
    openPayableModal,
    openEditPayable,
    closePayableModal,
    savePayable,

    loadData,
  };
}
