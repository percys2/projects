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

    const { data: taxes, error } = await supabase
      .from("taxes")
      .select("*")
      .eq("org_id", org.id)
      .order("name");

    if (error) throw error;

    return NextResponse.json({ taxes: taxes || [] });
  } catch (err) {
    console.error("GET taxes error:", err);
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

    if (body.is_default) {
      await supabase
        .from("taxes")
        .update({ is_default: false })
        .eq("org_id", org.id);
    }

    const { error } = await supabase.from("taxes").insert({
      org_id: org.id,
      name: body.name,
      rate: body.rate,
      is_default: body.is_default || false,
      is_active: body.is_active !== false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST tax error:", err);
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

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    if (body.is_default) {
      await supabase
        .from("taxes")
        .update({ is_default: false })
        .eq("org_id", org.id);
    }

    const { error } = await supabase
      .from("taxes")
      .update({
        name: body.name,
        rate: body.rate,
        is_default: body.is_default,
        is_active: body.is_active,
      })
      .eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT tax error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing tax id" }, { status: 400 });
    }

    const { error } = await supabase.from("taxes").delete().eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE tax error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
