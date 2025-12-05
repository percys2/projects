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

    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("*")
      .eq("org_id", org.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (paymentsError) throw paymentsError;

    const { data: priorPayments, error: priorError } = await supabase
      .from("payments")
      .select("amount, direction")
      .eq("org_id", org.id)
      .lt("date", startDate);

    let openingBalance = 0;
    (priorPayments || []).forEach((p) => {
      if (p.direction === "in") {
        openingBalance += p.amount || 0;
      } else {
        openingBalance -= p.amount || 0;
      }
    });

    const inflows = (payments || [])
      .filter((p) => p.direction === "in")
      .map((p) => ({
        date: p.date,
        description: p.notes || "Cobro",
        amount: p.amount || 0,
        method: p.method,
      }));

    const outflows = (payments || [])
      .filter((p) => p.direction === "out")
      .map((p) => ({
        date: p.date,
        description: p.notes || "Pago",
        amount: p.amount || 0,
        method: p.method,
      }));

    const totalInflows = inflows.reduce((sum, i) => sum + i.amount, 0);
    const totalOutflows = outflows.reduce((sum, o) => sum + o.amount, 0);
    const netFlow = totalInflows - totalOutflows;
    const closingBalance = openingBalance + netFlow;

    return NextResponse.json({
      cashFlow: {
        openingBalance,
        inflows,
        outflows,
        totalInflows,
        totalOutflows,
        netFlow,
        closingBalance,
        period: month || "current",
      },
    });
  } catch (err) {
    console.error("Cash Flow error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}