"use client";

import React from "react";
import Link from "next/link";

export default function SubscriptionCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Pago Cancelado
        </h1>

        <p className="text-slate-600 mb-8">
          Tu proceso de pago fue cancelado. No se realizó ningún cargo a tu tarjeta.
        </p>

        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-2">¿Tienes dudas?</h3>
          <p className="text-sm text-slate-600">
            Si tienes preguntas sobre nuestros planes o necesitas ayuda, no dudes en contactarnos.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
          >
            Ver Planes
          </Link>

          <Link
            href="/dashboard"
            className="block w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-all"
          >
            Volver al Dashboard
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-500">
          ¿Necesitas ayuda?{" "}
          <a href="mailto:soporte@agroerp.com" className="text-blue-600 hover:underline">
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
