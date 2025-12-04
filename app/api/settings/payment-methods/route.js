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

    const { data: methods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("org_id", org.id)
      .order("name");

    if (error) throw error;

    return NextResponse.json({ paymentMethods: methods || [] });
  } catch (err) {
    console.error("GET payment methods error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
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

    const { error } = await supabase.from("payment_methods").insert({
      org_id: org.id,
      name: body.name,
      code: body.code,
      requires_reference: body.requires_reference || false,
      is_active: body.is_active !== false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST payment method error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");
    const body = await request.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabase
      .from("payment_methods")
      .update({
        name: body.name,
        code: body.code,
        requires_reference: body.requires_reference,
        is_active: body.is_active,
      })
      .eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT payment method error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing payment method id" }, { status: 400 });
    }

    const { error } = await supabase.from("payment_methods").delete().eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE payment method error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
