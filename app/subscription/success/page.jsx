"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-emerald-200 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mx-auto"></div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              ¡Suscripción Activada!
            </h1>

            <p className="text-slate-600 mb-8">
              Tu suscripción ha sido procesada exitosamente. Ya puedes disfrutar de todas las funciones de tu plan.
            </p>

            <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
              <h3 className="font-semibold text-slate-900 mb-4">¿Qué sigue?</h3>
              <ul className="text-left space-y-3 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                    1
                  </span>
                  Configura tu empresa en Ajustes
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                    2
                  </span>
                  Agrega tus empleados en el módulo de RRHH
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                    3
                  </span>
                  Configura tu inventario y productos
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-3 flex-shrink-0">
                    4
                  </span>
                  ¡Empieza a usar el sistema!
                </li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Ir al Dashboard
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            <p className="mt-6 text-sm text-slate-500">
              Recibirás un correo de confirmación con los detalles de tu suscripción.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
