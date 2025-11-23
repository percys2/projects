"use client";

import { useEffect, useMemo, useState } from "react";

// =============================
// 🔥 EXPORTA ESTO (evita el error)
// =============================
export const CATEGORIES = [
  "Alimentos",
  "Medicinas",
  "Accesorios",
  "Herramientas",
  "Otros",
];

// Este hook ahora recibe `orgId` desde el server
export function useInventory(orgId) {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [branch, setBranch] = useState("TODAS");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modal / edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/inventory", {
          headers: {
            "x-org-id": orgId
          }
        });

        const json = await res.json();
        if (json.inventory) {
          setInventory(
            json.inventory.map((item) => ({
              id: item.id,
              productId: item.products.id,
              name: item.products.name,
              sku: item.products.id,
              category: item.products.category,
              branch: item.branches?.name || "Sin sucursal",
              stock: item.quantity,
              minStock: item.products.min_stock,
              cost: item.cost,
              price: item.price,
              unitWeight: item.products.unit_weight,
              expiresAt: item.expiration_date,
              lot: item.lot_number
            }))
          );
        }
      } catch (err) {
        console.error("Inventory fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (orgId) load();
  }, [orgId]);

  const getStock = (p) => p.stock ?? 0;

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();

    return inventory.filter((p) => {
      const matchesCategory =
        category === "TODOS" ? true : p.category === category;

      const matchesBranch = branch === "TODAS" ? true : p.branch === branch;

      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        String(p.sku).toLowerCase().includes(term);

      const matchesLowStock = lowStockOnly
        ? getStock(p) <= (p.minStock ?? 0)
        : true;

      return (
        matchesCategory &&
        matchesBranch &&
        matchesSearch &&
        matchesLowStock
      );
    });
  }, [inventory, search, category, branch, lowStockOnly]);

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
      (p) => getStock(p) <= (p.minStock ?? 0)
    ).length;

    return {
      totalProducts,
      totalUnits,
      inventoryValue,
      potentialRevenue,
      lowStockCount
    };
  }, [inventory]);

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

  function saveProductLocal(data) {
    setInventory((prev) =>
      prev.map(p => (p.id === data.id ? { ...p, ...data } : p))
    );

    closeModal();
  }

  function deleteProductLocal(id) {
    setInventory((prev) => prev.filter((p) => p.id !== id));
  }

  return {
    products: inventory,
    filteredProducts,
    stats,

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

    saveProduct: saveProductLocal,
    deleteProduct: deleteProductLocal,

    loading,
  };
}
