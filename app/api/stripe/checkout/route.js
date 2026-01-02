import { NextResponse } from "next/server";
import { stripe, PLANS } from "@/src/lib/stripe/config";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const body = await req.json();
    const { planId } = body;

    if (!planId || !PLANS[planId]) {
      return NextResponse.json({ error: "Plan inválido" }, { status: 400 });
    }

    const plan = PLANS[planId];

    if (!plan.priceId) {
      return NextResponse.json({ error: "Este plan no tiene precio configurado" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, stripe_customer_id")
      .eq("id", orgId)
      .single();

    if (orgError) throw orgError;

    let customerId = org.stripe_customer_id;

    if (!customerId) {
      const { data: user } = await supabaseAdmin
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      const customer = await stripe.customers.create({
        email: user?.email,
        metadata: {
          org_id: orgId,
          org_name: org.name,
        },
      });

      customerId = customer.id;

      await supabaseAdmin
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", orgId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/cancel`,
      metadata: {
        org_id: orgId,
        plan_id: planId,
      },
      subscription_data: {
        metadata: {
          org_id: orgId,
          plan_id: planId,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
