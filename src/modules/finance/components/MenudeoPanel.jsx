"use client";

import React, { useState, useEffect, useCallback } from "react";

export default function MenudeoPanel({ orgSlug }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [abonoAmount, setAbonoAmount] = useState("");
  const [abonoNotes, setAbonoNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [todayPayments, setTodayPayments] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/clients/menudeo", {
        headers: { "x-org-slug": orgSlug },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);

      const paymentsRes = await fetch("/api/finance/payments", {
        headers: { "x-org-slug": orgSlug },
      });
      const paymentsJson = await paymentsRes.json();
      if (paymentsRes.ok && paymentsJson.payments) {
        const today = new Date().toISOString().split("T")[0];
        const menudeoPayments = paymentsJson.payments.filter(
          (p) => p.client_id === json.client?.id && p.direction === "in"
        );
        const todayOnly = menudeoPayments.filter((p) => p.date === today);
        setTodayPayments(todayOnly);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAbono = async () => {
    if (!abonoAmount || parseFloat(abonoAmount) <= 0) {
      alert("Ingrese un monto valido");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/clients/menudeo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          amount: parseFloat(abonoAmount),
          notes: abonoNotes || "Abono Menudeo",
          date: new Date().toISOString().split("T")[0],
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setAbonoAmount("");
      setAbonoNotes("");
      await loadData();
      alert(`Abono registrado exitosamente. Total aplicado: C$ ${json.totalApplied?.toLocaleString("es-NI")}`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500">Cargando datos de Menudeo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  const pendingReceivables = (data?.receivables || []).filter((r) => r.status !== "paid");
  const paidReceivables = (data?.receivables || []).filter((r) => r.status === "paid");

  const todayTotal = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <p className="text-xs text-red-600 font-medium">Saldo Pendiente</p>
          <p className="text-2xl font-bold text-red-800">
            C$ {(data?.stats?.totalDebt || 0).toLocaleString("es-NI")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
          <p className="text-xs text-emerald-600 font-medium">Total Abonado</p>
          <p className="text-2xl font-bold text-emerald-800">
            C$ {(data?.stats?.totalPaid || 0).toLocaleString("es-NI")}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
          <p className="text-xs text-blue-600 font-medium">Cuentas Pendientes</p>
          <p className="text-2xl font-bold text-blue-800">
            {data?.stats?.pendingReceivables || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <p className="text-xs text-amber-600 font-medium">Abonos Hoy</p>
          <p className="text-2xl font-bold text-amber-800">
            C$ {todayTotal.toLocaleString("es-NI")}
          </p>
          <p className="text-xs text-amber-600">{todayPayments.length} abono(s)</p>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm p-4">
        <h3 className="font-semibold text-slate-800 mb-4">Registrar Abono Rapido</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Monto del Abono *</label>
            <input
              type="number"
              value={abonoAmount}
              onChange={(e) => setAbonoAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Nota (opcional)</label>
            <input
              type="text"
              value={abonoNotes}
              onChange={(e) => setAbonoNotes(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Ej: Abono cliente X"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAbono}
              disabled={submitting || !abonoAmount}
              className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Procesando..." : "Registrar Abono"}
            </button>
          </div>
        </div>
      </div>

      {todayPayments.length > 0 && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-amber-50">
            <h3 className="font-semibold text-amber-800">Abonos de Hoy ({new Date().toLocaleDateString("es-NI")})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Hora</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Monto</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Metodo</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Nota</th>
                </tr>
              </thead>
              <tbody>
                {todayPayments.map((payment) => (
                  <tr key={payment.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-600">
                      {new Date(payment.created_at).toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-emerald-600">
                      C$ {(payment.amount || 0).toLocaleString("es-NI")}
                    </td>
                    <td className="px-4 py-2 text-slate-600 capitalize">{payment.method || "efectivo"}</td>
                    <td className="px-4 py-2 text-slate-500">{payment.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-slate-800">Cuentas Pendientes ({pendingReceivables.length})</h3>
        </div>
        {pendingReceivables.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No hay cuentas pendientes
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Factura</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Total</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Abonado</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Saldo</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {pendingReceivables.map((rec) => {
                  const balance = (rec.total || 0) - (rec.amount_paid || 0);
                  return (
                    <tr key={rec.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-800">{rec.factura}</td>
                      <td className="px-4 py-2 text-slate-600">
                        {rec.fecha ? new Date(rec.fecha).toLocaleDateString("es-NI") : "-"}
                      </td>
                      <td className="px-4 py-2 text-right text-slate-800">
                        C$ {(rec.total || 0).toLocaleString("es-NI")}
                      </td>
                      <td className="px-4 py-2 text-right text-emerald-600">
                        C$ {(rec.amount_paid || 0).toLocaleString("es-NI")}
                      </td>
                      <td className="px-4 py-2 text-right font-bold text-red-600">
                        C$ {balance.toLocaleString("es-NI")}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.status === "partial" 
                            ? "bg-amber-100 text-amber-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {rec.status === "partial" ? "Parcial" : "Pendiente"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {paidReceivables.length > 0 && (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-emerald-50">
            <h3 className="font-semibold text-emerald-800">Cuentas Pagadas ({paidReceivables.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Factura</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-600">Fecha</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-slate-600">Total</th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-slate-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {paidReceivables.slice(0, 10).map((rec) => (
                  <tr key={rec.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-800">{rec.factura}</td>
                    <td className="px-4 py-2 text-slate-600">
                      {rec.fecha ? new Date(rec.fecha).toLocaleDateString("es-NI") : "-"}
                    </td>
                    <td className="px-4 py-2 text-right text-slate-800">
                      C$ {(rec.total || 0).toLocaleString("es-NI")}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700">
                        Pagado
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paidReceivables.length > 10 && (
              <div className="px-4 py-2 text-center text-xs text-slate-500 border-t">
                Mostrando 10 de {paidReceivables.length} cuentas pagadas
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
