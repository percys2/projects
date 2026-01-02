"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PLANS } from "@/src/lib/stripe/config";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const plans = Object.values(PLANS).filter((plan) => plan.id !== "free");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl">
            Planes y Precios
          </h1>
          <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto">
            Elige el plan perfecto para tu empresa. Todos incluyen 14 días de prueba gratis.
          </p>
        </div>

        <div className="mt-12 flex justify-center">
          <div className="relative bg-slate-100 rounded-lg p-1 flex">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                billingPeriod === "monthly"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 text-sm font-medium rounded-md transition-all ${
                billingPeriod === "yearly"
                  ? "bg-white text-slate-900 shadow"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Anual
              <span className="ml-2 text-xs text-emerald-600 font-semibold">-20%</span>
            </button>
          </div>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? "ring-2 ring-blue-600" : "border border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                  Más Popular
                </div>
              )}

              <div className="p-8">
                <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-500">{plan.description}</p>

                <div className="mt-6">
                  <span className="text-4xl font-extrabold text-slate-900">
                    ${billingPeriod === "yearly" ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-slate-500">/mes</span>
                  {billingPeriod === "yearly" && (
                    <p className="text-sm text-emerald-600 mt-1">
                      Facturado anualmente (${Math.round(plan.price * 0.8 * 12)}/año)
                    </p>
                  )}
                </div>

                <Link
                  href="/register"
                  className={`mt-8 block w-full py-3 px-4 rounded-lg text-center font-semibold transition-all ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  Comenzar Prueba Gratis
                </Link>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0"
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
                      <span className="ml-3 text-sm text-slate-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-slate-900 rounded-2xl p-8 lg:p-12">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                ¿Necesitas un plan personalizado?
              </h2>
              <p className="mt-2 text-slate-300">
                Contáctanos para soluciones empresariales con funciones adicionales.
              </p>
            </div>
            <div className="mt-6 lg:mt-0">
              <a
                href="mailto:ventas@agroerp.com"
                className="inline-flex items-center px-6 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-slate-100 transition-all"
              >
                Contactar Ventas
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900">¿Puedo cambiar de plan después?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Sí, puedes actualizar o degradar tu plan en cualquier momento. Los cambios se aplican inmediatamente.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900">¿Qué métodos de pago aceptan?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express).
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900">¿Hay contrato o compromiso?</h3>
              <p className="mt-2 text-sm text-slate-600">
                No hay contratos. Puedes cancelar en cualquier momento y seguirás teniendo acceso hasta el final del período pagado.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h3 className="font-semibold text-slate-900">¿Ofrecen soporte técnico?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Todos los planes incluyen soporte por email. Los planes Pro y Enterprise incluyen soporte prioritario.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
