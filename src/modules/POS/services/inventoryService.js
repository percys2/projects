export const inventoryService = {
  async getInventory(orgSlug, branch) {
    try {
      const response = await fetch(`/api/inventory?slug=${orgSlug}`, {
        headers: {
          'x-org-slug': orgSlug,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }

      const data = await response.json();
      
      // Filter by branch if specified
      if (branch && data.inventory) {
        return data.inventory.filter((item) => 
          item.branches?.name === branch
        );
      }

      return data.inventory || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  async getProducts(orgSlug) {
    try {
      const response = await fetch(`/api/products?slug=${orgSlug}`, {
        headers: {
          'x-org-slug': orgSlug,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async decreaseStock(orgSlug, productId, branchId, qty) {
    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-slug': orgSlug,
        },
        body: JSON.stringify({
          orgId: orgSlug,
          productId,
          branchId,
          type: 'salida',
          qty,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to decrease stock');
      }

      return await response.json();
    } catch (error) {
      console.error('Error decreasing stock:', error);
      throw error;
    }
  },
};