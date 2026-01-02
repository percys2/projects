"use client";

import React, { useState, useEffect } from "react";
import { useOrganization } from "@/src/context/OrganizationContext";
import { PLANS } from "@/src/lib/stripe/config";

export default function SubscriptionSettings() {
  const { organization } = useOrganization();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [organization?.id]);

  const fetchSubscription = async () => {
    if (!organization?.id) return;
    
    try {
      const res = await fetch("/api/stripe/subscription", {
        headers: { "x-org-id": organization.id },
      });
      const data = await res.json();
      setSubscription(data);
    } catch (err) {
      console.error("Error fetching subscription:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": organization.id,
        },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al procesar");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error al procesar el pago");
    } finally {
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "x-org-id": organization.id },
      });
      const data = await res.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Error al abrir portal");
      }
    } catch (err) {
      console.error("Portal error:", err);
      alert("Error al abrir el portal de facturación");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-32 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const currentPlan = subscription?.plan || PLANS.free;
  const status = subscription?.status || "trial";

  const getStatusBadge = () => {
    const statusConfig = {
      active: { label: "Activo", color: "bg-emerald-100 text-emerald-800" },
      trialing: { label: "Período de prueba", color: "bg-blue-100 text-blue-800" },
      trial: { label: "Período de prueba", color: "bg-blue-100 text-blue-800" },
      past_due: { label: "Pago pendiente", color: "bg-amber-100 text-amber-800" },
      canceled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
      incomplete: { label: "Incompleto", color: "bg-slate-100 text-slate-800" },
    };
    const config = statusConfig[status] || statusConfig.trial;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Suscripción</h2>
        <p className="text-sm text-slate-500 mt-1">
          Gestiona tu plan y facturación
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Plan Actual: {currentPlan.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{currentPlan.description}</p>
          </div>
          {getStatusBadge()}
        </div>

        {subscription?.subscription && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Precio:</span>
                <span className="ml-2 font-medium">${currentPlan.price}/mes</span>
              </div>
              <div>
                <span className="text-slate-500">Próximo cobro:</span>
                <span className="ml-2 font-medium">
                  {subscription.subscription.currentPeriodEnd
                    ? new Date(subscription.subscription.currentPeriodEnd).toLocaleDateString("es")
                    : "N/A"}
                </span>
              </div>
            </div>
            {subscription.subscription.cancelAtPeriodEnd && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  Tu suscripción se cancelará al final del período actual.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 mb-3">Límites de tu plan:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(currentPlan.limits).map(([key, value]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {value === -1 ? "∞" : value}
                </div>
                <div className="text-xs text-slate-500 capitalize">
                  {key === "employees" ? "Empleados" :
                   key === "branches" ? "Sucursales" :
                   key === "users" ? "Usuarios" :
                   key === "products" ? "Productos" : key}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {subscription?.subscription ? (
            <button
              onClick={handleManageSubscription}
              disabled={actionLoading}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-all"
            >
              {actionLoading ? "Cargando..." : "Gestionar Suscripción"}
            </button>
          ) : (
            <button
              onClick={() => handleUpgrade("basico")}
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all"
            >
              {actionLoading ? "Cargando..." : "Actualizar Plan"}
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Planes Disponibles</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.values(PLANS)
            .filter((plan) => plan.id !== "free")
            .map((plan) => (
              <div
                key={plan.id}
                className={`bg-white border rounded-lg p-5 ${
                  plan.id === currentPlan.id
                    ? "border-blue-500 ring-2 ring-blue-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                  {plan.popular && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-500">/mes</span>
                </div>
                <ul className="space-y-2 mb-4">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center text-sm text-slate-600">
                      <svg
                        className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0"
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
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.id !== currentPlan.id && (
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={actionLoading}
                    className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-all text-sm font-medium"
                  >
                    {actionLoading ? "..." : "Seleccionar"}
                  </button>
                )}
                {plan.id === currentPlan.id && (
                  <div className="w-full py-2 px-4 bg-blue-50 text-blue-700 rounded-lg text-center text-sm font-medium">
                    Plan Actual
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
