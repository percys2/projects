import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

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
        clients (first_name, last_name)
      `)
      .eq("org_id", org.id)
      .in("status", ["unpaid", "partial"])
      .order("fecha", { ascending: false });

    if (error) throw error;

    const receivables = (sales || []).map((s) => ({
      ...s,
      client_name: s.clients ? `${s.clients.first_name} ${s.clients.last_name}` : null,
    }));

    return NextResponse.json({ receivables });
  } catch (err) {
    console.error("Receivables GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
