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

    const { data: receivables, error } = await supabase
      .from("ar_receivables")
      .select(`
        id,
        client_id,
        invoice_number,
        description,
        date,
        due_date,
        total,
        amount_paid,
        status,
        notes,
        created_at,
        clients (id, first_name, last_name, email, phone)
      `)
      .eq("org_id", org.id)
      .order("date", { ascending: false });

    if (error) {
      if (error.code === "42P01") {
        return NextResponse.json({ receivables: [] });
      }
      throw error;
    }

    const formattedReceivables = (receivables || []).map(r => ({
      ...r,
      client_name: r.clients ? `${r.clients.first_name} ${r.clients.last_name}` : "Sin cliente",
      factura: r.invoice_number,
      fecha: r.date,
    }));

    return NextResponse.json({ receivables: formattedReceivables });
  } catch (err) {
    console.error("Receivables GET error:", err);
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

    const total = parseFloat(body.total) || 0;
    const amount_paid = parseFloat(body.amount_paid) || 0;
    let status = "pending";
    if (amount_paid >= total && total > 0) {
      status = "paid";
    } else if (amount_paid > 0) {
      status = "partial";
    }

    const { data: receivable, error } = await supabase
      .from("ar_receivables")
      .insert({
        org_id: org.id,
        client_id: body.client_id || null,
        invoice_number: body.invoice_number || null,
        description: body.description || null,
        date: body.date || new Date().toISOString().split("T")[0],
        due_date: body.due_date || null,
        total,
        amount_paid,
        status,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ receivable, success: true });
  } catch (err) {
    console.error("Receivables POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing org slug or id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const total = parseFloat(body.total) || 0;
    const amount_paid = parseFloat(body.amount_paid) || 0;
    let status = "pending";
    if (amount_paid >= total && total > 0) {
      status = "paid";
    } else if (amount_paid > 0) {
      status = "partial";
    }

    const { data: receivable, error } = await supabase
      .from("ar_receivables")
      .update({
        client_id: body.client_id || null,
        invoice_number: body.invoice_number || null,
        description: body.description || null,
        date: body.date,
        due_date: body.due_date || null,
        total,
        amount_paid,
        status,
        notes: body.notes || null,
      })
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ receivable, success: true });
  } catch (err) {
    console.error("Receivables PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing org slug or id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("ar_receivables")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Receivables DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
