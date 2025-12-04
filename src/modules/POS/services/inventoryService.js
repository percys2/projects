export const inventoryService = {
  async getInventory(orgSlug, branchName = null) {
    const response = await fetch(`/api/inventory`, {
      headers: { "x-org-slug": orgSlug },
    });

    const data = await response.json();
    const items = data.inventory ?? [];

    if (branchName) {
      return items.filter(i => i.branches?.name === branchName);
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
