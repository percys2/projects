"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

export function useSales(orgSlug) {
  const [sales, setSales] = useState([]);
  const [totals, setTotals] = useState({ 
    totalRevenue: 0, 
    totalItems: 0, 
    totalMargin: 0, 
    totalCost: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [branches, setBranches] = useState([]);
  
  const [filters, setFilters] = useState({
    dateStart: "",
    dateEnd: "",
    search: "",
    selectedBranch: "",
  });

  const [page, setPage] = useState(0);
  const limit = 50;

  const loadBranches = useCallback(async () => {
    try {
      const res = await fetch("/api/branches", {
        headers: { "x-org-slug": orgSlug },
      });
      const json = await res.json();
      const activeBranches = (json.branches || []).filter(b => b.is_active);
      setBranches(activeBranches);
    } catch (err) {
      console.error("Error loading branches:", err);
    }
  }, [orgSlug]);

  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ limit, offset: page * limit });
      if (filters.dateStart) params.append("startDate", filters.dateStart);
      if (filters.dateEnd) params.append("endDate", filters.dateEnd);
      if (filters.selectedBranch) params.append("branchId", filters.selectedBranch);

      const res = await fetch(`/api/sales?${params.toString()}`, {
        headers: { "x-org-slug": orgSlug },
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Error loading sales");

      setSales(json.sales || []);
      setTotals(json.totals || { totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug, filters.dateStart, filters.dateEnd, filters.selectedBranch, page, limit]);

  const cancelSale = useCallback(async (saleId, restoreInventory = false) => {
    const message = restoreInventory 
      ? "Estas seguro de ANULAR esta venta? El inventario sera restaurado."
      : "Estas seguro de ELIMINAR esta venta permanentemente? Esta accion no se puede deshacer y NO restaurara el inventario.";
    
    if (!confirm(message)) return false;
    
    try {
      const res = await fetch("/api/sales", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: saleId, restoreInventory }),
      });
      
      if (res.ok) {
        const data = await res.json();
        alert(data.message || "Operacion exitosa");
        loadSales();
        return true;
      } else {
        const data = await res.json();
        alert("Error: " + (data.error || "No se pudo completar la operacion"));
        return false;
      }
    } catch (err) {
      alert("Error: " + err.message);
      return false;
    }
  }, [orgSlug, loadSales]);

  const filteredSales = useMemo(() => {
    if (!filters.search) return sales;
    const term = filters.search.toLowerCase();
    return sales.filter((s) => {
      const clientName = s?.client_name || 
        `${s?.clients?.first_name || ""} ${s?.clients?.last_name || ""}`.trim() || 
        "Cliente general";
      return clientName.toLowerCase().includes(term) ||
        s.factura?.toLowerCase().includes(term) ||
        s.id?.toLowerCase().includes(term);
    });
  }, [sales, filters.search]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateStart: "",
      dateEnd: "",
      search: "",
      selectedBranch: "",
    });
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    if (orgSlug) {
      loadBranches();
    }
  }, [orgSlug, loadBranches]);

  useEffect(() => {
    if (orgSlug) {
      loadSales();
    }
  }, [orgSlug, loadSales]);

  return {
    sales,
    filteredSales,
    totals,
    loading,
    error,
    branches,
    filters,
    page,
    limit,
    updateFilter,
    clearFilters,
    nextPage,
    prevPage,
    cancelSale,
    reload: loadSales,
  };
}