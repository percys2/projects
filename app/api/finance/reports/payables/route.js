import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import * as Sentry from "@sentry/nextjs";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;

    const rateLimitResult = rateLimit(`reports:${orgId}`, 100, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const supabase = supabaseAdmin;

    const { data: bills, error } = await supabase
      .from("ap_bills")
      .select(`
        id,
        reference,
        date,
        due_date,
        total,
        amount_paid,
        status,
        notes,
        supplier_id,
        suppliers (id, name, phone, email)
      `)
      .eq("org_id", orgId)
      .in("status", ["open", "partial", "pending"])
      .order("date", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ payables: [] });
      }
      throw error;
    }

    const payables = (bills || []).map((b) => ({
      ...b,
      supplier_name: b.suppliers?.name || "Sin proveedor",
      balance: (b.total || 0) - (b.amount_paid || 0),
      days_overdue: b.due_date 
        ? Math.max(0, Math.floor((new Date() - new Date(b.due_date)) / (1000 * 60 * 60 * 24)))
        : 0,
    }));

    const summary = {
      total_payables: payables.reduce((sum, p) => sum + p.balance, 0),
      total_count: payables.length,
      overdue_count: payables.filter(p => p.days_overdue > 0).length,
      overdue_amount: payables.filter(p => p.days_overdue > 0).reduce((sum, p) => sum + p.balance, 0),
    };

    return NextResponse.json({ payables, summary });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Payables Report GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}