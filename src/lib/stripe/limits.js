import { supabaseAdmin } from "@/src/lib/supabase/server";
import { PLANS, getPlanById } from "./config";

export async function checkSubscriptionLimit(orgId, limitType) {
  try {
    const { data: org, error } = await supabaseAdmin
      .from("organizations")
      .select("subscription_plan, subscription_status, trial_ends_at")
      .eq("id", orgId)
      .single();

    if (error) throw error;

    const plan = getPlanById(org.subscription_plan || "free");
    const limit = plan.limits[limitType];

    if (limit === -1) {
      return { allowed: true, limit: "ilimitado", plan: plan.id };
    }

    let currentCount = 0;

    switch (limitType) {
      case "employees":
        const { count: empCount } = await supabaseAdmin
          .from("employees")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId)
          .eq("status", "active");
        currentCount = empCount || 0;
        break;

      case "branches":
        const { count: branchCount } = await supabaseAdmin
          .from("branches")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId);
        currentCount = branchCount || 0;
        break;

      case "users":
        const { count: userCount } = await supabaseAdmin
          .from("user_organizations")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId);
        currentCount = userCount || 0;
        break;

      case "products":
        const { count: productCount } = await supabaseAdmin
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("org_id", orgId);
        currentCount = productCount || 0;
        break;

      default:
        return { allowed: true, limit: "unknown", plan: plan.id };
    }

    return {
      allowed: currentCount < limit,
      limit,
      current: currentCount,
      remaining: Math.max(0, limit - currentCount),
      plan: plan.id,
    };
  } catch (err) {
    console.error("Error checking subscription limit:", err);
    return { allowed: true, limit: "error", plan: "free" };
  }
}

export async function getSubscriptionStatus(orgId) {
  try {
    const { data: org, error } = await supabaseAdmin
      .from("organizations")
      .select("subscription_plan, subscription_status, trial_ends_at")
      .eq("id", orgId)
      .single();

    if (error) throw error;

    const plan = getPlanById(org.subscription_plan || "free");
    const isTrialExpired = org.trial_ends_at && new Date(org.trial_ends_at) < new Date();
    const isActive = ["active", "trialing"].includes(org.subscription_status) || 
                     (org.subscription_status === "trial" && !isTrialExpired);

    return {
      plan,
      status: org.subscription_status,
      isActive,
      isTrialExpired,
      trialEndsAt: org.trial_ends_at,
      limits: plan.limits,
    };
  } catch (err) {
    console.error("Error getting subscription status:", err);
    return {
      plan: PLANS.free,
      status: "error",
      isActive: false,
      isTrialExpired: true,
      limits: PLANS.free.limits,
    };
  }
}

export async function enforceLimit(orgId, limitType, errorMessage) {
  const result = await checkSubscriptionLimit(orgId, limitType);
  
  if (!result.allowed) {
    const plan = getPlanById(result.plan);
    throw new Error(
      errorMessage || 
      `Has alcanzado el límite de ${limitType} (${result.limit}) para el plan ${plan.name}. Actualiza tu plan para agregar más.`
    );
  }
  
  return result;
}
