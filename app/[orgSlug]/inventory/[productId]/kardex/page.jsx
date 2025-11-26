"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Link from "next/link";

export default function KardexPage({ params }) {
  const { orgSlug, productId } = params;

  const [product, setProduct] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     CARGAR DATOS DEL PRODUCTO
  ============================================================ */
 async function loadProduct() {
  const supabase = createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  setProduct(data);
}
  /* ============================================================
     CARGAR MOVIMIENTOS DEL KARDEX
  ============================================================ */
async function loadKardex() {
  const supabase = createClient();
  const { data } = await supabase
    .from("kardex")
    .select("*")
    .eq("product_id", productId)
    .order("created_at");
  setKardex(data || []);
}
  useEffect(() => {
    loadProduct();
    loadKardex();
  }, [productId]);

  if (loading) return <p className="p-6 text-slate-600">Cargando kardex...</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-5">

      {/* --------------------------------------------------------
          HEADER
      -------------------------------------------------------- */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">
            Kardex — {product?.name}
          </h1>
          <p className="text-sm text-slate-500">
            Historial completo de movimientos de inventario.
          </p>
        </div>

        <Link
          href={`/app/${orgSlug}/inventory`}
          className="px-3 py-2 text-xs bg-slate-800 text-white rounded-lg hover:bg-slate-700"
        >
          ← Volver al inventario
        </Link>
      </div>

      {/* --------------------------------------------------------
          RESUMEN DEL PRODUCTO
      -------------------------------------------------------- */}
      <div className="bg-white rounded-xl border shadow p-4 text-sm">
        <p><span className="font-semibold">SKU:</span> {product?.sku}</p>
        <p><span className="font-semibold">Categoría:</span> {product?.category}</p>
        <p><span className="font-semibold">Sucursal:</span> {product?.branch}</p>
        <p><span className="font-semibold">Stock actual:</span> {product?.stock}</p>
        <p><span className="font-semibold">Costo:</span> C$ {product?.cost}</p>
        <p><span className="font-semibold">Precio:</span> C$ {product?.price}</p>
      </div>

      {/* --------------------------------------------------------
          TABLA DEL KARDEX
      -------------------------------------------------------- */}
      <div className="bg-white rounded-xl border shadow p-4 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-600 text-xs uppercase">
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Tipo</th>
              <th className="px-3 py-2 text-right">Cantidad</th>
              <th className="px-3 py-2 text-left">Sucursal</th>
              <th className="px-3 py-2 text-left">De</th>
              <th className="px-3 py-2 text-left">A</th>
              <th className="px-3 py-2 text-right">Costo</th>
              <th className="px-3 py-2 text-right">Precio</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Descripción</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-3 py-2">
                  {new Date(r.created_at).toLocaleString("es-NI")}
                </td>

                <td className="px-3 py-2 font-semibold">
                  {r.type === "entrada" && (
                    <span className="text-emerald-600">Entrada</span>
                  )}
                  {r.type === "salida" && (
                    <span className="text-red-600">Salida</span>
                  )}
                  {r.type === "traslado" && (
                    <span className="text-blue-600">Traslado</span>
                  )}
                </td>

                <td className="px-3 py-2 text-right">{r.qty}</td>
                <td className="px-3 py-2">{r.branch}</td>
                <td className="px-3 py-2">{r.from_branch || "—"}</td>
                <td className="px-3 py-2">{r.to_branch || "—"}</td>

                <td className="px-3 py-2 text-right">
                  {r.cost ? `C$ ${r.cost}` : "—"}
                </td>

                <td className="px-3 py-2 text-right">
                  {r.price ? `C$ ${r.price}` : "—"}
                </td>

                <td className="px-3 py-2">{r.created_by || "—"}</td>
                <td className="px-3 py-2">{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {records.length === 0 && (
          <p className="text-center py-4 text-slate-400 text-sm">
            No hay movimientos registrados para este producto.
          </p>
        )}
      </div>

    </div>
  );
}
