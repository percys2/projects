import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

// Avoid failing `next build` when STRIPE_SECRET_KEY isn't set (fail only when used).
export const stripe =
  stripeSecretKey && stripeSecretKey.trim()
    ? new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" })
    : new Proxy(
        {},
        {
          get() {
            throw new Error(
              "Stripe env vars missing. Set STRIPE_SECRET_KEY (and price IDs) to use billing features."
            );
          },
        }
      );

export const PLANS = {
  free: {
    id: "free",
    name: "Prueba Gratuita",
    description: "14 días de prueba con todas las funciones",
    price: 0,
    priceId: null,
    features: [
      "Hasta 5 empleados",
      "1 sucursal",
      "Módulos básicos",
      "Soporte por email",
    ],
    limits: {
      employees: 5,
      branches: 1,
      users: 2,
      products: 100,
    },
    trialDays: 14,
  },
  basico: {
    id: "basico",
    name: "Plan Básico",
    description: "Ideal para pequeñas empresas",
    price: 29,
    priceId: process.env.STRIPE_PRICE_BASICO,
    features: [
      "Hasta 10 empleados",
      "2 sucursales",
      "Todos los módulos",
      "Planilla mensual",
      "Reportes INSS/IR",
      "Soporte por email",
    ],
    limits: {
      employees: 10,
      branches: 2,
      users: 5,
      products: 500,
    },
  },
  pro: {
    id: "pro",
    name: "Plan Pro",
    description: "Para empresas en crecimiento",
    price: 79,
    priceId: process.env.STRIPE_PRICE_PRO,
    popular: true,
    features: [
      "Hasta 50 empleados",
      "5 sucursales",
      "Todos los módulos",
      "Planilla quincenal/mensual",
      "Reportes avanzados",
      "CRM completo",
      "Soporte prioritario",
    ],
    limits: {
      employees: 50,
      branches: 5,
      users: 15,
      products: 2000,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Plan Enterprise",
    description: "Para grandes empresas",
    price: 199,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE,
    features: [
      "Empleados ilimitados",
      "Sucursales ilimitadas",
      "Todos los módulos",
      "Multi-país (Nicaragua, Guatemala, El Salvador, Honduras)",
      "API access",
      "Soporte dedicado 24/7",
      "Capacitación incluida",
    ],
    limits: {
      employees: -1,
      branches: -1,
      users: -1,
      products: -1,
    },
  },
};

export function getPlanById(planId) {
  return PLANS[planId] || PLANS.free;
}

export function getPlanByPriceId(priceId) {
  return Object.values(PLANS).find((plan) => plan.priceId === priceId) || PLANS.free;
}

export function checkLimit(plan, limitType, currentValue) {
  const planConfig = getPlanById(plan);
  const limit = planConfig.limits[limitType];
  if (limit === -1) return { allowed: true, limit: "ilimitado" };
  return {
    allowed: currentValue < limit,
    limit,
    current: currentValue,
    remaining: Math.max(0, limit - currentValue),
  };
}
