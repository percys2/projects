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

    // Get accounts
    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .eq("org_id", org.id)
      .eq("is_active", true);

    if (accountsError) throw accountsError;

    // Calculate date range for the month
    let startDate, endDate;
    if (month) {
      startDate = `${month}-01`;
      const [year, monthNum] = month.split("-").map(Number);
      const lastDay = new Date(year, monthNum, 0).getDate();
      endDate = `${month}-${lastDay}`;
    } else {
      const now = new Date();
      startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      endDate = now.toISOString().split("T")[0];
    }

    // Get journal entries for the period
    const { data: journalLines, error: journalError } = await supabase
      .from("journal_entry_lines")
      .select(`
        account_id,
        debit,
        credit,
        journal_entries!inner (date)
      `)
      .eq("org_id", org.id)
      .gte("journal_entries.date", startDate)
      .lte("journal_entries.date", endDate);

    if (journalError) throw journalError;

    // Calculate balances per account
    const balances = {};
    (journalLines || []).forEach((line) => {
      if (!balances[line.account_id]) {
        balances[line.account_id] = 0;
      }
      // For income: credits increase, debits decrease
      // For expenses: debits increase, credits decrease
      balances[line.account_id] += (line.credit || 0) - (line.debit || 0);
    });

    // Filter income accounts (type = 'income' or 'revenue')
    const income = (accounts || [])
      .filter((a) => a.type === "income" || a.type === "revenue")
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        amount: Math.abs(balances[a.id] || 0),
      }))
      .filter((a) => a.amount !== 0);

    // Filter expense accounts
    const expenses = (accounts || [])
      .filter((a) => a.type === "expense")
      .map((a) => ({
        id: a.id,
        code: a.code,
        name: a.name,
        amount: Math.abs(balances[a.id] || 0),
      }))
      .filter((a) => a.amount !== 0);

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netIncome = totalIncome - totalExpenses;

    return NextResponse.json({
      incomeStatement: {
        income,
        expenses,
        totalIncome,
        totalExpenses,
        netIncome,
        period: month || "current",
      },
    });
  } catch (err) {
    console.error("Income Statement error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
