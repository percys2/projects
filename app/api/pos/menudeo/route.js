import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    let query = supabase
      .from("menudeo_transactions")
      .select("*")
      .eq("org_id", org.id)
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    const { data: transactions, error } = await query;

    if (error) throw error;

    const totalDebt = (transactions || [])
      .filter(t => t.status === "pending")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      success: true,
      transactions: transactions || [],
      totalDebt,
      count: transactions?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching menudeo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();

    const { data: transaction, error } = await supabase
      .from("menudeo_transactions")
      .insert({
        org_id: org.id,
        branch_id: body.branch_id || null,
        amount: Number(body.amount) || 0,
        description: body.description || "Venta de menudeo",
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    const { data: pendingTransactions } = await supabase
      .from("menudeo_transactions")
      .select("amount")
      .eq("org_id", org.id)
      .eq("status", "pending");

    const totalDebt = (pendingTransactions || []).reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      success: true,
      transaction,
      totalDebt,
      message: "Menudeo registrado exitosamente",
    });
  } catch (error) {
    console.error("Error saving menudeo:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}