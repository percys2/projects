"use client";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

export default function KardexDrawer({ open, onClose, product, orgSlug }) {
  const [loading, setLoading] = useState(false);
  const [movements, setMovements] = useState([]);

  // Obtener el ID correcto del producto (según tu BD)
  const productId = product?.product_id ?? product?.productId ?? product?.id;

  useEffect(() => {
    if (!open || !productId) return;

    async function loadKardex() {
      setLoading(true);

      try {
        const res = await fetch(`/api/kardex`, {
          headers: {
            "x-org-slug": orgSlug,
            "x-product-id": productId,
          },
        });

        const json = await res.json();

        if (json.success) {
          setMovements(json.data);
        } else {
          console.error("KARDEX ERROR:", json.error);
        }
      } catch (err) {
        console.error("Kardex fetch error:", err);
      }

      setLoading(false);
    }

    loadKardex();
  }, [open, productId, orgSlug]);

  // ================================
  // DATOS PARA GRÁFICA
  // ================================
  const chartData = {
    labels: movements.map((m) =>
      m.created_at ? m.created_at.substring(0, 10) : "Fecha"
    ),
    datasets: [
      {
        label: "Stock",
        borderColor: "#4F46E5",
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        data: movements.map((m) => m.running_stock ?? m.qty ?? 0),
      },
    ],
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[420px] bg-white border-l shadow-xl transition-transform duration-300 z-50 
      ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      {/* HEADER */}
      <div className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-sm font-semibold">Historial de Movimientos</h2>
          <p className="text-xs text-slate-500">{product?.name}</p>
        </div>

        <button
          onClick={onClose}
          className="text-slate-600 hover:text-black text-lg"
        >
          ✕
        </button>
      </div>

      {/* BOTON VOLVER */}
      <div className="p-3 border-b bg-white">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-300 transition"
        >
          ← Volver al Inventario
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="p-4 overflow-y-auto h-full pb-24 space-y-4">

        {/* LOADING */}
        {loading && (
          <p className="text-center text-sm text-slate-500">Cargando...</p>
        )}

        {/* SIN MOVIMIENTOS */}
        {!loading && movements.length === 0 && (
          <p className="text-center text-sm text-slate-400">
            No hay movimientos registrados.
          </p>
        )}

        {/* GRÁFICA */}
        {!loading && movements.length > 0 && (
          <div className="bg-white border rounded-lg p-3 shadow-sm">
            <h3 className="text-xs font-semibold mb-2 text-slate-700">
              Evolución del stock
            </h3>
            <div className="h-36">
              <Line data={chartData} />
            </div>
          </div>
        )}

        {/* LISTA DE MOVIMIENTOS */}
        {!loading && movements.length > 0 && (
          <div className="space-y-3">
            {movements.map((m) => (
              <div
                key={m.id}
                className="p-3 border rounded-lg bg-slate-50 shadow-sm text-[12px]"
              >
                <div className="flex justify-between">
                  <p className="font-semibold text-slate-800">
                    {m.movement_type?.toUpperCase()}
                  </p>
                  <p className="text-slate-500">
                    {m.created_at?.substring(0, 10)}
                  </p>
                </div>

                <p className="text-slate-700 mt-1">
                  Cantidad: <strong>{m.qty}</strong>
                </p>

                {m.running_stock !== null && (
                  <p className="text-slate-600 text-[11px]">
                    Stock restante: {m.running_stock}
                  </p>
                )}

                {m.reference && (
                  <p className="mt-1 text-slate-500">
                    Ref: {m.reference}
                  </p>
                )}

                {m.notes && (
                  <p className="mt-1 text-slate-500">
                    Nota: {m.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}