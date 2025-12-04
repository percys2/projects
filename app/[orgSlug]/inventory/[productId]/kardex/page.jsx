"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function KardexPage() {
  const params = useParams();
  const orgSlug = params.orgSlug;
  const productId = params.productId;

  const [kardex, setKardex] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKardex() {
      const res = await fetch(`/api/kardex/${productId}`, {
        headers: { "x-org-slug": orgSlug }
      });

      const json = await res.json();
      setKardex(json.kardex || []);
      setLoading(false);
    }

    loadKardex();
  }, [orgSlug, productId]);


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">
        Kardex del producto {productId}
      </h1>

      <Link
        href={`/${orgSlug}/inventory`}
        className="text-blue-600 underline"
      >
        ← Volver al inventario
      </Link>

      {loading ? (
        <p className="mt-6">Cargando kardex...</p>
      ) : kardex.length === 0 ? (
        <p className="mt-6 text-gray-500">No hay movimientos.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {kardex.map((m) => (
            <div key={m.id} className="border p-3 rounded">
              <p><strong>Fecha:</strong> {m.created_at}</p>
              <p><strong>Tipo:</strong> {m.type}</p>
              <p><strong>Cantidad:</strong> {m.qty}</p>
              <p><strong>Costo:</strong> {m.cost}</p>
              <p><strong>Saldo:</strong> {m.saldo_acumulado}</p>
              <p><strong>Desde:</strong> {m.from_branch}</p>
              <p><strong>Hacia:</strong> {m.to_branch}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
