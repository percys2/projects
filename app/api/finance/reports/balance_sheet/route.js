import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const url = new URL(req.url);
    const month = url.searchParams.get("month");

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

    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("org_id", org.id)
      .eq("is_active", true);

    if (accountsError) throw accountsError;

    const endDate = month ? `${month}-31` : new Date().toISOString().split("T")[0];

    const { data: journalLines, error: journalError } = await supabase
      .from("journal_entry_lines")
      .select(`
        account_id,
        debit,
        credit,
        journal_entries!inner (date)
      `)
      .eq("org_id", org.id)
      .lte("journal_entries.date", endDate);

    const balances = {};
    (journalLines || []).forEach((line) => {
      if (!balances[line.account_id]) {
        balances[line.account_id] = 0;
      }
      balances[line.account_id] += (line.debit || 0) - (line.credit || 0);
    });

    const assets = (accounts || [])
      .filter((a) => a.type === "asset")
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        balance: balances[a.id] || 0,
      }))
      .filter((a) => a.balance !== 0);

    const liabilities = (accounts || [])
      .filter((a) => a.type === "liability")
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        balance: Math.abs(balances[a.id] || 0),
      }))
      .filter((a) => a.balance !== 0);

    const equity = (accounts || [])
      .filter((a) => a.type === "equity")
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        balance: Math.abs(balances[a.id] || 0),
      }))
      .filter((a) => a.balance !== 0);

    const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
    const totalEquity = equity.reduce((sum, e) => sum + e.balance, 0);

    return NextResponse.json({
      balanceSheet: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        period: month || "current",
      },
    });
  } catch (err) {
    console.error("Balance Sheet error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}