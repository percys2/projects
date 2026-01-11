import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const clientId = req.nextUrl.searchParams.get("clientId");

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

    if (clientId) {
      const { data: transactions, error } = await supabase
        .from("credit_transactions")
        .select(`
          *,
          clients(first_name, last_name, phone),
          sales(id, total, created_at)
        `)
        .eq("org_id", org.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const { data: client } = await supabase
        .from("clients")
        .select("id, first_name, last_name, phone, credit_limit, credit_balance, is_credit_client")
        .eq("id", clientId)
        .single();

      return NextResponse.json({ transactions: transactions || [], client });
    }

    const { data: creditClients, error } = await supabase
      .from("clients")
      .select("id, first_name, last_name, phone, credit_limit, credit_balance, is_credit_client")
      .eq("org_id", org.id)
      .eq("is_credit_client", true)
      .order("first_name");

    if (error) throw error;

    return NextResponse.json({ clients: creditClients || [] });
  } catch (err) {
    console.error("Credits GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const branchId = req.headers.get("x-branch-id");
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

    const { action, clientId, amount, paymentMethod, notes } = body;

    if (action === "payment") {
      const { data, error } = await supabase.rpc("register_credit_payment", {
        p_org_id: org.id,
        p_client_id: clientId,
        p_branch_id: branchId || null,
        p_amount: Number(amount),
        p_payment_method: paymentMethod || "cash",
        p_description: notes || null,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ success: true, transaction: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("Credits POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
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

    const { clientId, isCreditClient, creditLimit } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Missing client ID" }, { status: 400 });
    }

    const updateData = {};
    if (typeof isCreditClient === "boolean") {
      updateData.is_credit_client = isCreditClient;
    }
    if (typeof creditLimit === "number") {
      updateData.credit_limit = creditLimit;
    }

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", clientId)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, client });
  } catch (err) {
    console.error("Credits PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
