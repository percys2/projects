function useDashboardData(products) {
  if (!products || products.length === 0) {
    return {
      kpis: {
        totalProducts: 0,
        totalUnits: 0,
        inventoryValue: 0,
        potentialRevenue: 0,
        estimatedProfit: 0,
        highValueStock: [],
      },
      topFeeds: [],
      lowStock: [],
      categoryStats: [],
      rotation: [],
    };
  }

  // === KPIs base ===
  const totalProducts = products.length;
  const totalUnits = products.reduce((s, p) => s + p.stock, 0);
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.cost, 0);
  const potentialRevenue = products.reduce(
    (s, p) => s + p.stock * p.price,
    0
  );
  const estimatedProfit = potentialRevenue - inventoryValue;

  // === Top 5 por stock ===
  const sorted = [...products].sort((a, b) => b.stock - a.stock);
  const top5 = sorted.slice(0, 5);
  const max = top5[0]?.stock || 1;
  const topFeeds = top5.map((p) => ({
    name: p.name,
    stock: p.stock,
    percent: (p.stock / max) * 100,
  }));

  // === Bajo stock ===
  const lowStock = products.filter((p) => p.stock <= p.minStock);

  // === Categorías ===
  const categoryMap = {};
  for (const p of products) {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + p.stock;
  }
  const categoryStats = Object.entries(categoryMap).map(
    ([label, value]) => ({ label, value })
  );

  // === Productos de mayor valor inmovilizado ===
  const highValueStock = [...products]
    .map((p) => ({
      name: p.name,
      totalValue: p.stock * p.cost,
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  // === Rotación (estimada) ===
  const rotation = products.map((p) => ({
    name: p.name,
    rotation: Math.round((p.price - p.cost) / p.cost * 100), // margen %
  }));

  return {
    kpis: {
      totalProducts,
      totalUnits,
      inventoryValue,
      potentialRevenue,
      estimatedProfit,
      highValueStock,
    },
    topFeeds,
    lowStock,
    categoryStats,
    rotation,
  };
}
