"use client";

import { useEffect, useState } from "react";
import { kardexService } from "../services/kardexService";
import { usePathname } from "next/navigation";

export function useKardex(productId) {
  const pathname = usePathname();
  const orgSlug = pathname.split("/")[1]; // /masatepe/kardex

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId || !orgSlug) return;

    async function load() {
      try {
        const data = await kardexService.getKardex(orgSlug, productId);

        // Añadir cálculo de existencia acumulada
        let saldo = 0;

        const formatted = data.map((m) => {
          if (m.type === "entrada") {
            saldo += Number(m.quantity);
          } else if (m.type === "salida") {
            saldo -= Number(m.quantity);
          }

          return {
            ...m,
            running_balance: saldo
          };
        });

        setMovements(formatted);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [productId, orgSlug]);

  return { movements, loading };
}
