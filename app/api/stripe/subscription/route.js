import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { PLANS } from "@/src/lib/stripe/config";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("org_id", orgId)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!subscription) {
      return NextResponse.json({
        subscription: null,
        plan: PLANS.free,
        status: "trial",
        limits: PLANS.free.limits,
      });
    }

    const plan = PLANS[subscription.plan_id] || PLANS.free;

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        planId: subscription.plan_id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
      plan,
      status: subscription.status,
      limits: plan.limits,
    });
  } catch (err) {
    console.error("Get subscription error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
