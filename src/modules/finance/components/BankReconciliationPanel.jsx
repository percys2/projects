"use client";

import { useState, useMemo } from "react";
import { Check, X, Building2, RefreshCw } from "lucide-react";

export default function BankReconciliationPanel({ payments, expenses, cashAccounts, orgSlug }) {
  const [bankBalance, setBankBalance] = useState("");
  const [statementDate, setStatementDate] = useState(new Date().toISOString().slice(0, 10));
  const [reconciledIds, setReconciledIds] = useState(new Set());

  // Combine payments and expenses into transactions
  const transactions = useMemo(() => {
    const allTransactions = [];

    payments.forEach((p) => {
      allTransactions.push({
        id: `payment-${p.id}`,
        type: p.direction === "in" ? "ingreso" : "egreso",
        description: p.description || `Pago #${p.id}`,
        amount: p.amount || 0,
        date: p.date,
        reference: p.reference || "-",
        source: "payment",
      });
    });

    expenses.forEach((e) => {
      allTransactions.push({
        id: `expense-${e.id}`,
        type: "egreso",
        description: e.description || `Gasto #${e.id}`,
        amount: e.total || 0,
        date: e.date,
        reference: e.reference || "-",
        source: "expense",
      });
    });

    return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [payments, expenses]);

  // Calculate book balance
  const bookBalance = useMemo(() => {
    return transactions.reduce((sum, t) => {
      if (t.type === "ingreso") return sum + t.amount;
      return sum - t.amount;
    }, 0);
  }, [transactions]);

  // Calculate reconciled balance
  const reconciledBalance = useMemo(() => {
    return transactions
      .filter((t) => reconciledIds.has(t.id))
      .reduce((sum, t) => {
        if (t.type === "ingreso") return sum + t.amount;
        return sum - t.amount;
      }, 0);
  }, [transactions, reconciledIds]);

  const toggleReconciled = (id) => {
    setReconciledIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const difference = parseFloat(bankBalance || 0) - reconciledBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-slate-600" />
        <h3 className="font-semibold text-slate-800">Conciliación Bancaria</h3>
      </div>

      {/* Bank Statement Input */}
      <div className="bg-slate-50 rounded-lg p-4 border">
        <h4 className="text-sm font-medium text-slate-700 mb-3">Estado de Cuenta Bancario</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Fecha del Estado</label>
            <input
              type="date"
              value={statementDate}
              onChange={(e) => setStatementDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Saldo según Banco (C$)</label>
            <input
              type="number"
              value={bankBalance}
              onChange={(e) => setBankBalance(e.target.value)}
              placeholder="0.00"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Cuenta Bancaria</label>
            <select className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="">Seleccionar cuenta...</option>
              {cashAccounts?.filter(a => a.subtype === "bank").map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-600">Saldo según Banco</p>
          <p className="text-lg font-bold text-blue-700">
            C$ {parseFloat(bankBalance || 0).toLocaleString("es-NI")}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border">
          <p className="text-xs text-slate-600">Saldo en Libros</p>
          <p className="text-lg font-bold text-slate-700">
            C$ {bookBalance.toLocaleString("es-NI")}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
          <p className="text-xs text-emerald-600">Conciliado</p>
          <p className="text-lg font-bold text-emerald-700">
            C$ {reconciledBalance.toLocaleString("es-NI")}
          </p>
        </div>
        <div className={`rounded-lg p-3 border ${
          Math.abs(difference) < 0.01 
            ? "bg-green-50 border-green-200" 
            : "bg-red-50 border-red-200"
        }`}>
          <p className={`text-xs ${Math.abs(difference) < 0.01 ? "text-green-600" : "text-red-600"}`}>
            Diferencia
          </p>
          <p className={`text-lg font-bold ${
            Math.abs(difference) < 0.01 ? "text-green-700" : "text-red-700"
          }`}>
            C$ {difference.toLocaleString("es-NI")}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-2 border-b flex justify-between items-center">
          <span className="text-sm font-medium text-slate-700">
            Transacciones ({transactions.length})
          </span>
          <span className="text-xs text-slate-500">
            {reconciledIds.size} conciliadas
          </span>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left w-10"></th>
                <th className="px-3 py-2 text-left">Fecha</th>
                <th className="px-3 py-2 text-left">Descripción</th>
                <th className="px-3 py-2 text-left">Referencia</th>
                <th className="px-3 py-2 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr 
                  key={t.id} 
                  className={`border-b hover:bg-slate-50 cursor-pointer ${
                    reconciledIds.has(t.id) ? "bg-green-50" : ""
                  }`}
                  onClick={() => toggleReconciled(t.id)}
                >
                  <td className="px-3 py-2">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                      reconciledIds.has(t.id) 
                        ? "bg-green-500 border-green-500" 
                        : "border-slate-300"
                    }`}>
                      {reconciledIds.has(t.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{t.date}</td>
                  <td className="px-3 py-2">{t.description}</td>
                  <td className="px-3 py-2 text-slate-500">{t.reference}</td>
                  <td className={`px-3 py-2 text-right font-medium ${
                    t.type === "ingreso" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "ingreso" ? "+" : "-"} C$ {t.amount.toLocaleString("es-NI")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-300">
          Importar Extracto (Próximamente)
        </button>
        <button 
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
          onClick={() => alert("Conciliación guardada")}
        >
          Guardar Conciliación
        </button>
      </div>
    </div>
  );
}