import { NextResponse } from "next/server";
import { getSubscriptionStatus } from "./limits";

export async function withSubscription(handler, options = {}) {
  return async (req, context) => {
    const { requireActive = true, requiredPlan = null } = options;

    try {
      const orgId = req.headers.get("x-org-id");
      
      if (!orgId) {
        return NextResponse.json(
          { error: "Organización no especificada" },
          { status: 400 }
        );
      }

      const subscription = await getSubscriptionStatus(orgId);

      if (requireActive && !subscription.isActive) {
        if (subscription.isTrialExpired) {
          return NextResponse.json(
            { 
              error: "Tu período de prueba ha expirado",
              code: "TRIAL_EXPIRED",
              upgradeUrl: "/pricing"
            },
            { status: 402 }
          );
        }
        
        return NextResponse.json(
          { 
            error: "Tu suscripción no está activa",
            code: "SUBSCRIPTION_INACTIVE",
            upgradeUrl: "/pricing"
          },
          { status: 402 }
        );
      }

      if (requiredPlan) {
        const planHierarchy = ["free", "basico", "pro", "enterprise"];
        const currentPlanIndex = planHierarchy.indexOf(subscription.plan.id);
        const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

        if (currentPlanIndex < requiredPlanIndex) {
          return NextResponse.json(
            { 
              error: `Esta función requiere el plan ${requiredPlan} o superior`,
              code: "PLAN_REQUIRED",
              requiredPlan,
              currentPlan: subscription.plan.id,
              upgradeUrl: "/pricing"
            },
            { status: 402 }
          );
        }
      }

      req.subscription = subscription;
      return handler(req, context);
    } catch (err) {
      console.error("Subscription middleware error:", err);
      return NextResponse.json(
        { error: "Error verificando suscripción" },
        { status: 500 }
      );
    }
  };
}

export function createSubscriptionGuard(options = {}) {
  return (handler) => withSubscription(handler, options);
}

export const requireBasico = createSubscriptionGuard({ requiredPlan: "basico" });
export const requirePro = createSubscriptionGuard({ requiredPlan: "pro" });
export const requireEnterprise = createSubscriptionGuard({ requiredPlan: "enterprise" });
