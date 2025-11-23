"use client";

import React, { useEffect, useState } from "react";
import KardexTable from "./kardexTable";

export default function KardexScreen({ orgId, productId }) {
  const [movements, setMovements] = useState([]);
  const [productName, setProductName] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/kardex", {
        headers: {
          "x-org-id": orgId,
          "x-product-id": productId,
        },
      });

      const json = await res.json();
      setMovements(json.movements || []);

      const p = await fetch(`/api/products/${productId}`, {
        headers: { "x-org-id": orgId },
      });

      const pj = await p.json();
      setProductName(pj.product?.name || "Producto");
    } catch (err) {
      console.error("Kardex error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <div>
        <h1 className="text-xl font-semibold text-slate-800">
          Kardex — {productName}
        </h1>
        <p className="text-sm text-slate-500">
          Historial de entradas, salidas y traslados.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Cargando movimientos...</p>
      ) : (
        <KardexTable movements={movements} />
      )}
    </div>
  );
}
