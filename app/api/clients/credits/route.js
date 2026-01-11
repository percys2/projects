import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

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
        .select("*")
        .eq("org_id", org.id)
        .eq("client_id", clientId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({ transactions: transactions || [] });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", org.id)
      .eq("is_credit_client", true)
      .order("first_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ clients: clients || [] });
  } catch (err) {
    console.error("Credits GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
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

    const { clientId, branchId, amount, paymentMethod, description } = body;

    if (!clientId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: result, error } = await supabase.rpc("register_credit_payment", {
      p_org_id: org.id,
      p_client_id: clientId,
      p_branch_id: branchId || null,
      p_amount: amount,
      p_payment_method: paymentMethod || "cash",
      p_description: description || "Abono de credito",
    });

    if (error) throw error;

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const { data: updatedClient } = await supabase
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .single();

    return NextResponse.json({
      success: true,
      transaction_id: result.transaction_id,
      new_balance: result.new_balance,
      client: updatedClient,
    });
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
    if (isCreditClient !== undefined) {
      updateData.is_credit_client = isCreditClient;
    }
    if (creditLimit !== undefined) {
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

    return NextResponse.json(client);
  } catch (err) {
    console.error("Credits PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
