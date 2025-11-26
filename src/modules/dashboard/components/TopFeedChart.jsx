export default function TopFeedChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        <p className="text-sm">No hay datos de productos disponibles</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{item.name}</span>
            <span className="text-slate-600">{item.stock} uds</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(item.percent || 0, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
