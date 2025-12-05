import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
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
        supplier_id,
        suppliers (name)
      `)
      .eq("org_id", org.id)
      .in("status", ["open", "partial"])
      .order("date", { ascending: false });

    if (error) throw error;

    const payables = (bills || []).map((b) => ({
      ...b,
      supplier_name: b.suppliers?.name,
    }));

    return NextResponse.json({ payables });
  } catch (err) {
    console.error("Payables GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}