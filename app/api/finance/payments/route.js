import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { postPaymentToGL } from "@/src/lib/services/journalService";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: payments, error } = await supabase
      .from("payments")
      .select(`
        *,
        clients (first_name, last_name),
        suppliers (name)
      `)
      .eq("org_id", org.id)
      .order("date", { ascending: false });

    if (error) throw error;

    const paymentsWithNames = (payments || []).map((p) => ({
      ...p,
      client_name: p.clients ? `${p.clients.first_name} ${p.clients.last_name}` : null,
      supplier_name: p.suppliers?.name,
    }));

    return NextResponse.json({ payments: paymentsWithNames });
  } catch (err) {
    console.error("Payments GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const paymentData = {
      org_id: org.id,
      date: body.date,
      client_id: body.client_id || null,
      supplier_id: body.supplier_id || null,
      sale_id: body.sale_id || null,
      bill_id: body.bill_id || null,
      amount: body.amount || 0,
      method: body.method || "efectivo",
      direction: body.direction || "out",
      account_id: body.account_id || null,
      notes: body.notes || null,
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .insert(paymentData)
      .select()
      .single();

    if (error) throw error;

    if (body.sale_id && body.direction === "in") {
      const { data: sale } = await supabase
        .from("sales")
        .select("total, amount_paid")
        .eq("id", body.sale_id)
        .single();

      if (sale) {
        const newAmountPaid = (sale.amount_paid || 0) + body.amount;
        const newStatus = newAmountPaid >= sale.total ? "paid" : "partial";

        await supabase
          .from("sales")
          .update({ amount_paid: newAmountPaid, status: newStatus })
          .eq("id", body.sale_id);
      }
    }

    if (body.bill_id && body.direction === "out") {
      const { data: bill } = await supabase
        .from("ap_bills")
        .select("total, amount_paid")
        .eq("id", body.bill_id)
        .single();

      if (bill) {
        const newAmountPaid = (bill.amount_paid || 0) + body.amount;
        const newStatus = newAmountPaid >= bill.total ? "paid" : "partial";

        await supabase
          .from("ap_bills")
          .update({ amount_paid: newAmountPaid, status: newStatus })
          .eq("id", body.bill_id);
      }
    }

    try {
      await postPaymentToGL(org.id, payment);
    } catch (glError) {
      console.error("GL posting error (non-blocking):", glError);
    }

    return NextResponse.json({ payment }, { status: 201 });
  } catch (err) {
    console.error("Payments POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updateData = {
      date: body.date,
      client_id: body.client_id || null,
      supplier_id: body.supplier_id || null,
      amount: body.amount || 0,
      method: body.method || "efectivo",
      direction: body.direction || "out",
      account_id: body.account_id || null,
      notes: body.notes || null,
    };

    const { data: payment, error } = await supabase
      .from("payments")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ payment });
  } catch (err) {
    console.error("Payments PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payments DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
