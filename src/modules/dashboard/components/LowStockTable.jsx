export default function LowStockTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No hay productos con stock bajo</p>
        <p className="text-xs mt-1">Todos los productos tienen stock suficiente</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
              Producto
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
              Cantidad
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const quantity = Number(item.quantity);
            const isVeryLow = quantity < 5;
            const statusColor = isVeryLow ? "text-red-600 bg-red-50" : "text-orange-600 bg-orange-50";
            const statusText = isVeryLow ? "Crítico" : "Bajo";

            return (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-3 px-4 text-sm text-slate-900">
                  {item.products?.name || "Producto sin nombre"}
                </td>
                <td className="py-3 px-4 text-sm text-right font-medium text-slate-900">
                  {quantity} uds
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
