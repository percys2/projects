import { useState, useEffect } from "react";

export function useSalesData(orgSlug) {
  const [sales, setSales] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalMargin: 0,
    averageMargin: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    try {
      const response = await fetch(`/api/sales?slug=${orgSlug}`);
      if (response.ok) {
        const data = await response.json();
        setSales(data || []);
        calculateStats(data || []);
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (salesList) => {
    const totalRevenue = salesList.reduce((sum, s) => sum + (s.subtotal || 0), 0);
    const totalMargin = salesList.reduce((sum, s) => sum + (s.margen || 0), 0);
    const avgMargin = salesList.length > 0 
      ? salesList.reduce((sum, s) => sum + (s.porcentaje || 0), 0) / salesList.length
      : 0;

    setStats({
      totalSales: salesList.length,
      totalRevenue,
      totalMargin,
      averageMargin: avgMargin,
    });
  };

  const addSale = async (saleData) => {
    try {
      const response = await fetch(`/api/sales?slug=${orgSlug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        await fetchSales();
      }
    } catch (error) {
      console.error("Error adding sale:", error);
    }
  };

  const updateSale = async (id, saleData) => {
    try {
      const response = await fetch(`/api/sales?slug=${orgSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...saleData }),
      });

      if (response.ok) {
        await fetchSales();
      }
    } catch (error) {
      console.error("Error updating sale:", error);
    }
  };

  const deleteSale = async (id) => {
    try {
      const response = await fetch(`/api/sales?slug=${orgSlug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        await fetchSales();
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  };

  useEffect(() => {
    if (orgSlug) {
      fetchSales();
    }
  }, [orgSlug]);

  return {
    sales,
    stats,
    loading,
    addSale,
    updateSale,
    deleteSale,
    refreshData: fetchSales,
  };
}
