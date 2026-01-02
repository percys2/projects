"use client";

import { useEffect, useMemo, useState } from "react";

export const DEFAULT_CATEGORIES = [
  "Alimentos",
  "Medicinas",
  "Accesorios",
  "Herramientas",
  "Otros",
];

export const SUBCATEGORY_ORDER = [
  "BROILER",
  "CABALLO",
  "CRIOLLO",
  "PERRO",
  "PERRO DOGUI",
  "PERRO DOGUI CACHO",
  "PERRO GATO",
  "PERRO PET",
  "PONEDORAS",
  "PORCICULTURA",
  "FERRETERIA",
  "VETERINARIA",
  "PET ACCESORIES",
];

export function useInventory(orgSlug) {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("TODOS");
  const [subcategory, setSubcategory] = useState("TODOS");
  const [branch, setBranch] = useState("TODAS");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  async function loadInventory() {
    try {
      setLoading(true);

      const res = await fetch("/api/inventory/stock", {
        headers: { "x-org-slug": orgSlug },
      });

      const json = await res.json();

      if (json.stock) {
        const mapped = json.stock.map((item) => ({
          id: `${item.product_id}-${item.branch_id}`,
          productId: item.product_id,
          branchId: item.branch_id,
          branch: item.branch_name ?? "Sin sucursal",
          name: item.name,
          sku: item.sku ?? item.product_id,
          category: item.category,
          subcategory: item.subcategory || null,
          stock: Number(item.stock ?? 0),
          minStock: item.min_stock ?? 0,
          cost: item.cost ?? 0,
          price: item.price ?? 0,
          unitWeight: item.unit_weight ?? 0,
          expiresAt: item.expires_at ?? null,
        }));

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

  const filteredProducts = useMemo(() => {
    const term = search.toLowerCase();

    let filtered = inventory.filter((p) => {
      const matchesCategory = category === "TODOS" || p.category === category;
      const matchesSubcategory = subcategory === "TODOS" || p.subcategory === subcategory;
      const matchesBranch = branch === "TODAS" || p.branch === branch;

      const matchesSearch =
        p.name?.toLowerCase().includes(term) ||
        String(p.sku).toLowerCase().includes(term);

      const matchesLowStock = lowStockOnly
        ? getStock(p) <= Number(p.minStock ?? 0)
        : true;

      return (
        matchesCategory &&
        matchesSubcategory &&
        matchesBranch &&
        matchesSearch &&
        matchesLowStock
      );
    });

    // Ordenar por subcategory según SUBCATEGORY_ORDER
    filtered.sort((a, b) => {
      const idxA = SUBCATEGORY_ORDER.indexOf(a.subcategory);
      const idxB = SUBCATEGORY_ORDER.indexOf(b.subcategory);
      
      // Si ambos tienen subcategory en el orden
      if (idxA !== -1 && idxB !== -1) {
        if (idxA !== idxB) return idxA - idxB;
      }
      // Si solo uno tiene subcategory
      if (idxA !== -1 && idxB === -1) return -1;
      if (idxA === -1 && idxB !== -1) return 1;
      
      // Si ambos no tienen subcategory o tienen la misma, ordenar por nombre
      return (a.name || "").localeCompare(b.name || "");
    });

    return filtered;
  }, [inventory, search, category, subcategory, branch, lowStockOnly]);

  const categories = useMemo(() => {
    const cats = inventory
      .map((p) => p.category)
      .filter((c) => c && c.trim())
      .map((c) => c.trim());
    const uniqueCats = [...new Set(cats)].sort();
    return uniqueCats.length > 0 ? uniqueCats : DEFAULT_CATEGORIES;
  }, [inventory]);

  const subcategories = useMemo(() => {
    const subs = inventory
      .map((p) => p.subcategory)
      .filter((s) => s && s.trim())
      .map((s) => s.trim());
    const uniqueSubs = [...new Set(subs)];
    return uniqueSubs.sort((a, b) => {
      const idxA = SUBCATEGORY_ORDER.indexOf(a);
      const idxB = SUBCATEGORY_ORDER.indexOf(b);
      if (idxA === -1 && idxB === -1) return a.localeCompare(b);
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  }, [inventory]);

  const stats = useMemo(() => {
    const dataSource = filteredProducts;
    
    const totalProducts = dataSource.length;

    const totalUnits = dataSource.reduce(
      (sum, p) => sum + getStock(p),
      0
    );

    const inventoryValue = dataSource.reduce(
      (sum, p) => sum + getStock(p) * (p.cost ?? 0),
      0
    );

    const potentialRevenue = dataSource.reduce(
      (sum, p) => sum + getStock(p) * (p.price ?? 0),
      0
    );

    const lowStockCount = dataSource.filter(
      (p) => getStock(p) <= Number(p.minStock ?? 0)
    ).length;

    return {
      totalProducts,
      totalUnits,
      inventoryValue,
      potentialRevenue,
      lowStockCount,
    };
  }, [filteredProducts]);

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
          subcategory: data.subcategory || null,
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
        if (err.error && err.error.includes("movimientos históricos")) {
          return { 
            success: false, 
            error: err.error,
            hasHistory: true,
            productId: product.productId 
          };
        }
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

  async function toggleProductActive(productId, active) {
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ id: productId, active }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Error al cambiar estado del producto");
      }

      await loadInventory();
      return { success: true };

    } catch (err) {
      console.error("Toggle product active error:", err);
      return { success: false, error: err.message };
    }
  }

  return {
    products: inventory,
    filteredProducts,
    stats,
    branches,
    categories,
    subcategories,

    search,
    setSearch,
    category,
    setCategory,
    subcategory,
    setSubcategory,
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
    toggleProductActive,
    loadInventory,

    loading,
    setProducts: setInventory,
  };
}