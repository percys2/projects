"use client";

export default function AbonoModal({ 
  isOpen, 
  receivable, 
  amount, 
  onAmountChange, 
  onClose, 
  onSubmit, 
  saving 
}) {
  if (!isOpen || !receivable) return null;

  const balance = (receivable.total || 0) - (receivable.amount_paid || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="px-4 py-3 border-b flex justify-between items-center">
          <h2 className="font-semibold text-slate-800">Registrar Abono</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-medium">{receivable.client_name || "Cliente"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Factura:</span>
              <span className="font-medium">{receivable.factura}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total:</span>
              <span className="font-medium">C$ {(receivable.total || 0).toLocaleString("es-NI")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pagado:</span>
              <span className="font-medium">C$ {(receivable.amount_paid || 0).toLocaleString("es-NI")}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-slate-700 font-medium">Saldo Pendiente:</span>
              <span className="font-bold text-red-600">
                C$ {balance.toLocaleString("es-NI")}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Monto del Abono *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
              max={balance}
              autoFocus
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-emerald-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span className="text-emerald-700">Nuevo saldo despues del abono:</span>
                <span className="font-bold text-emerald-700">
                  C$ {(balance - parseFloat(amount)).toLocaleString("es-NI", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              onClick={onSubmit}
              disabled={saving || !amount || parseFloat(amount) <= 0}
              className="px-4 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Registrar Abono"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
