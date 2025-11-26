export default function DashboardKpiCards({ kpis }) {
  const cards = [
    {
      title: "Ventas del Mes",
      value: kpis?.totalSales ? `$${Number(kpis.totalSales).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      icon: "💰",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      title: "Clientes",
      value: kpis?.clientsCount || 0,
      icon: "👥",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Productos",
      value: kpis?.productsCount || 0,
      icon: "📦",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    },
    {
      title: "Valor Inventario",
      value: kpis?.inventoryValue ? `$${Number(kpis.inventoryValue).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "$0.00",
      icon: "📊",
      color: "bg-orange-50 text-orange-700 border-orange-200"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`${card.color} rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
          </div>
          <h3 className="text-sm font-medium text-slate-600 mb-1">
            {card.title}
          </h3>
          <p className="text-2xl font-bold">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
