"use client";

import { useEffect, useMemo, useState } from "react";

export const CATEGORIES = [
  "Alimentos",
  "Medicinas",
  "Accesorios",
  "Herramientas",
  "Otros",
];

export function useInventory(orgSlug) {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [branch, setBranch] = useState("TODAS");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  /* ===========================================================
   * LOAD INVENTORY
   * =========================================================== */
  async function loadInventory() {
    try {
      setLoading(true);

      const res = await fetch("/api/inventory/stock", {
        headers: { "x-org-slug": orgSlug },
      });

      const json = await res.json();
      console.log("INVENTORY RAW JSON:", json);

      if (json.stock) {
        const mapped = json.stock.map((item) => ({
          id: `${item.product_id}-${item.branch_id}`,
          productId: item.product_id,

          branchId: item.branch_id,
          branch: item.branch_name ?? "Sin sucursal",

          name: item.name,
          sku: item.sku ?? item.product_id,
          category: item.category,

          stock: Number(item.stock ?? 0),

          minStock: item.min_stock ?? 0,

          cost: item.cost ?? 0,
          price: item.price ?? 0,

          unitWeight: item.unit_weight ?? 0,
          expiresAt: item.expires_at ?? null,
        }));

        console.log("INVENTORY MAPPED:", mapped);
        setInventory(mapped);
      }

      if (json.branches) setBranches(json.branches);

    } catch (err) {
      console.error("Inventory fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (orgSlug) loadInventory();
  }, [orgSlug]);

  const getStock = (p) => Number(p.stock ?? 0);

  /* ===========================================================
   * FILTERED PRODUCTS
   * =========================================================== */
  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();

    return inventory.filter((p) => {
      const matchesCategory = category === "TODOS" || p.category === category;
      const matchesBranch = branch === "TODAS" || p.branch === branch;

      const matchesSearch =
        p.name?.toLowerCase().includes(term) ||
        String(p.sku).toLowerCase().includes(term);

      const matchesLowStock = lowStockOnly
        ? getStock(p) <= Number(p.minStock ?? 0)
        : true;

      return (
        matchesCategory &&
        matchesBranch &&
        matchesSearch &&
        matchesLowStock
      );
    });
  }, [inventory, search, category, branch, lowStockOnly]);

  /* ===========================================================
   * STATS
   * =========================================================== */
  const stats = useMemo(() => {
    const totalProducts = inventory.length;

    const totalUnits = inventory.reduce(
      (sum, p) => sum + getStock(p),
      0
    );

    const inventoryValue = inventory.reduce(
      (sum, p) => sum + getStock(p) * (p.cost ?? 0),
      0
    );

    const potentialRevenue = inventory.reduce(
      (sum, p) => sum + getStock(p) * (p.price ?? 0),
      0
    );

    const lowStockCount = inventory.filter(
      (p) => getStock(p) <= Number(p.minStock ?? 0)
    ).length;

    return {
      totalProducts,
      totalUnits,
      inventoryValue,
      potentialRevenue,
      lowStockCount,
    };
  }, [inventory]);

  /* ===========================================================
   * MODAL HANDLERS
   * =========================================================== */
  function openNewProduct() {
    setEditingProduct(null);
    setIsModalOpen(true);
  }

  function openEditProduct(product) {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingProduct(null);
  }

  /* ===========================================================
   * SAVE PRODUCT
   * =========================================================== */
  async function saveProduct(data) {
    try {
      const method = data.productId ? "PUT" : "POST";

      const res = await fetch("/api/products", {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          id: data.productId,
          name: data.name,
          sku: data.sku,
          category: data.category,
          unitWeight: data.unitWeight,
          minStock: data.minStock,
          cost: data.cost,
          price: data.price,
          expiresAt: data.expiresAt,
          branchId: data.branchId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al guardar producto");
      }

      await loadInventory();
      closeModal();
      return { success: true };

    } catch (err) {
      console.error("Save product error:", err);
      return { success: false, error: err.message };
    }
  }

  /* ===========================================================
   * DELETE PRODUCT
   * =========================================================== */
  async function deleteProduct(id) {
    try {
      const product = inventory.find((p) => p.id === id);
      if (!product) return { success: false, error: "Producto no encontrado" };

      const res = await fetch("/api/inventory", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ productId: product.productId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al eliminar producto");
      }

      setInventory((prev) =>
        prev.filter((p) => p.productId !== product.productId)
      );

      return { success: true };

    } catch (err) {
      console.error("Delete product error:", err);
      return { success: false, error: err.message };
    }
  }

  /* ===========================================================
   * RETURN
   * =========================================================== */
  return {
    products: inventory,
    filteredProducts,
    stats,
    branches,

    search,
    setSearch,
    category,
    setCategory,
    branch,
    setBranch,
    lowStockOnly,
    setLowStockOnly,

    isModalOpen,
    editingProduct,
    openNewProduct,
    openEditProduct,
    closeModal,

    saveProduct,
    deleteProduct,
    loadInventory,

    loading,
    setProducts: setInventory,
  };
}
