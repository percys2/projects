"use client";

import { useEffect, useState, useMemo } from "react";

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
    const monthlyExpenses = expenses
      .filter((e) => {
        const expDate = new Date(e.date);
        const now = new Date();
        return (
          expDate.getMonth() === now.getMonth() &&
          expDate.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, e) => sum + (e.total || 0), 0);

    const cashIn = payments
      .filter((p) => p.direction === "in")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const cashOut = payments
      .filter((p) => p.direction === "out")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalReceivables,
      totalPayables,
      totalAssets,
      monthlyExpenses,
      cashIn,
      cashOut,
      netCashFlow: cashIn - cashOut,
    };
  }, [receivables, payables, assets, expenses, payments]);

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