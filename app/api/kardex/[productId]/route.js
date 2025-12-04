"use client";

import { useEffect, useState } from "react";
import KardexScreen from "@/src/modules/kardex/kardexScreen";

export default function ProductKardexPage({ params }) {
  const { orgSlug, productId } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          headers: { "x-org-slug": orgSlug },
        });

        const json = await res.json();
        if (json?.product) setProduct(json.product);
      } catch (err) {
        console.error("Error cargando producto:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [orgSlug, productId]);

  return (
    <div className="p-6 space-y-6">
      <a href={`/` + orgSlug + `/inventory`} className="text-blue-600 text-sm">
        ← Volver al inventario
      </a>

      {loading && <p>Cargando producto...</p>}

      {!loading && product && (
        <h1 className="text-2xl font-bold">
          Kardex del producto <span className="text-emerald-700">{product.name}</span>
        </h1>
      )}

      {!loading && !product && (
        <h1 className="text-2xl font-bold text-red-600">
          Producto no encontrado
        </h1>
      )}

      <KardexScreen orgSlug={orgSlug} />
    </div>
  );
}
