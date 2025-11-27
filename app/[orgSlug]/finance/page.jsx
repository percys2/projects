"use client";

import { use } from "react";

export default function FinancePage({ params }) {
  const { orgSlug } = use(params);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Finanzas</h1>
        <p className="text-sm text-slate-500">Módulo de finanzas - Próximamente</p>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-8 text-center">
        <p className="text-slate-400">
          El módulo de Finanzas está en desarrollo.
        </p>
        <p className="text-sm text-slate-400 mt-2">
          Incluirá: Cuentas por cobrar, Cuentas por pagar, Flujo de caja, Reportes financieros
        </p>
      </div>
    </div>
  );
}