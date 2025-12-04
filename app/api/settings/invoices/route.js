import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: settings, error } = await supabase
      .from("invoice_settings")
      .select("*")
      .eq("org_id", org.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ settings: settings || {} });
  } catch (err) {
    console.error("GET invoice settings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");
    const body = await request.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: existing } = await supabase
      .from("invoice_settings")
      .select("id")
      .eq("org_id", org.id)
      .single();

    const settingsData = {
      org_id: org.id,
      invoice_prefix: body.invoice_prefix,
      invoice_next_number: body.invoice_next_number,
      receipt_prefix: body.receipt_prefix,
      receipt_next_number: body.receipt_next_number,
      quote_prefix: body.quote_prefix,
      quote_next_number: body.quote_next_number,
      show_logo: body.show_logo,
      show_tax_breakdown: body.show_tax_breakdown,
      footer_text: body.footer_text,
      terms_and_conditions: body.terms_and_conditions,
    };

    if (existing) {
      const { error } = await supabase
        .from("invoice_settings")
        .update(settingsData)
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("invoice_settings").insert(settingsData);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT invoice settings error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
