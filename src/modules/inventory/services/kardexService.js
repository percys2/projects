export const inventoryService = {
  async getInventory(orgSlug, branchId = null) {
    const response = await fetch(`/api/inventory/stock`, {
      headers: { "x-org-slug": orgSlug },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Inventory fetch error:", data.error);
      return [];
    }
    
    // current_stock returns { stock: [...], branches: [...] }
    const items = data.stock ?? [];

    if (branchId) {
      return items.filter(i => 
        i.branch_id === branchId || 
        i.branch_name === branchId
      );
    }

    return items;
  },

  async decreaseStock(orgSlug, productId, branchId, qty) {
    const res = await fetch("/api/inventory/movements", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-slug": orgSlug,
      },
      body: JSON.stringify({
        productId,
        branchId,
        qty,
        type: "salida",
      }),
    });

    return await res.json();
  }
};
