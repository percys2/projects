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

    const { data: sales, error } = await supabase
      .from("sales")
      .select(`
        id,
        factura,
        fecha,
        total,
        amount_paid,
        status,
        due_date,
        client_id,
        clients (id, first_name, last_name, phone)
      `)
      .eq("org_id", orgId)
      .in("status", ["unpaid", "partial", "pending"])
      .order("fecha", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ receivables: [] });
      }
      throw error;
    }

    const receivables = (sales || []).map((s) => ({
      ...s,
      client_name: s.clients 
        ? `${s.clients.first_name || ""} ${s.clients.last_name || ""}`.trim() 
        : "Cliente general",
      balance: (s.total || 0) - (s.amount_paid || 0),
      days_overdue: s.due_date 
        ? Math.max(0, Math.floor((new Date() - new Date(s.due_date)) / (1000 * 60 * 60 * 24)))
        : 0,
    }));

    const summary = {
      total_receivables: receivables.reduce((sum, r) => sum + r.balance, 0),
      total_count: receivables.length,
      overdue_count: receivables.filter(r => r.days_overdue > 0).length,
      overdue_amount: receivables.filter(r => r.days_overdue > 0).reduce((sum, r) => sum + r.balance, 0),
    };

    return NextResponse.json({ receivables, summary });
  } catch (err) {
    Sentry.captureException(err);
    console.error("Receivables Report GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}