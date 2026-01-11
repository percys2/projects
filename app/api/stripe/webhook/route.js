import { NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/src/lib/stripe/config";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await handleSubscriptionCanceled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session) {
  const orgId = session.metadata?.org_id;
  const planId = session.metadata?.plan_id;

  if (!orgId) {
    console.error("No org_id in checkout session metadata");
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(session.subscription);

  await supabaseAdmin.from("subscriptions").upsert({
    org_id: orgId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: session.customer,
    plan_id: planId,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  }, { onConflict: "org_id" });

  await supabaseAdmin
    .from("organizations")
    .update({
      subscription_plan: planId,
      subscription_status: subscription.status,
    })
    .eq("id", orgId);
}

async function handleSubscriptionUpdate(subscription) {
  const orgId = subscription.metadata?.org_id;

  if (!orgId) {
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("org_id")
      .eq("stripe_subscription_id", subscription.id)
      .single();

    if (!sub) {
      console.error("No subscription found for:", subscription.id);
      return;
    }
  }

  const priceId = subscription.items.data[0]?.price?.id;
  const plan = getPlanByPriceId(priceId);

  await supabaseAdmin
    .from("subscriptions")
    .update({
      plan_id: plan.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
    })
    .eq("stripe_subscription_id", subscription.id);

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("org_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabaseAdmin
      .from("organizations")
      .update({
        subscription_plan: plan.id,
        subscription_status: subscription.status,
      })
      .eq("id", sub.org_id);
  }
}

async function handleSubscriptionCanceled(subscription) {
  await supabaseAdmin
    .from("subscriptions")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("org_id")
    .eq("stripe_subscription_id", subscription.id)
    .single();

  if (sub) {
    await supabaseAdmin
      .from("organizations")
      .update({
        subscription_plan: "free",
        subscription_status: "canceled",
      })
      .eq("id", sub.org_id);
  }
}

async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) return;

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("org_id")
    .eq("stripe_subscription_id", invoice.subscription)
    .single();

  if (sub) {
    await supabaseAdmin.from("subscription_invoices").insert({
      org_id: sub.org_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency,
      status: "paid",
      invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
    });
  }
}

async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) return;

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("org_id")
    .eq("stripe_subscription_id", invoice.subscription)
    .single();

  if (sub) {
    await supabaseAdmin
      .from("organizations")
      .update({ subscription_status: "past_due" })
      .eq("id", sub.org_id);

    await supabaseAdmin.from("subscription_invoices").insert({
      org_id: sub.org_id,
      stripe_invoice_id: invoice.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      status: "failed",
      invoice_url: invoice.hosted_invoice_url,
      period_start: new Date(invoice.period_start * 1000).toISOString(),
      period_end: new Date(invoice.period_end * 1000).toISOString(),
    });
  }
}
