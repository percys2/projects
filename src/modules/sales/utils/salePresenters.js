export const getClientName = (sale) => {
  if (sale?.client_name) return sale.client_name;
  const client = sale?.clients;
  if (!client) return "Cliente general";
  const firstName = client.first_name || "";
  const lastName = client.last_name || "";
  return `${firstName} ${lastName}`.trim() || "Cliente general";
};

export const getBranchName = (sale, branches = []) => {
  // First try to get branch name from the joined branch data
  if (sale?.branches?.name) return sale.branches.name;
  // Fallback to finding in branches array
  if (!sale?.branch_id) return "-";
  const branch = branches.find(b => b.id === sale.branch_id);
  return branch?.name || "-";
};

export const getProductNames = (sale, maxItems = 2) => {
  const items = sale?.sales_items || [];
  if (items.length === 0) return "-";
  const productDetails = items.map(item => {
    const name = item.products?.name || "Producto";
    const qty = item.quantity || 1;
    return `${name} (x${qty})`;
  }).slice(0, maxItems);
  const remaining = items.length - maxItems;
  if (remaining > 0) {
    return `${productDetails.join(", ")} +${remaining} mas`;
  }
  return productDetails.join(", ");
};

export const getItemsCount = (sale) => {
  return (sale?.sales_items || []).length;
};

export const getTotalQuantity = (sale) => {
  return (sale?.sales_items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
};