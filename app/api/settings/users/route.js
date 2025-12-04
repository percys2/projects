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

    const { data: users, error } = await supabase
      .from("org_users")
      .select("*")
      .eq("org_id", org.id)
      .order("full_name");

    if (error) throw error;

    return NextResponse.json({ users: users || [] });
  } catch (err) {
    console.error("GET users error:", err);
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

    const { error } = await supabase.from("org_users").insert({
      org_id: org.id,
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      is_active: body.is_active !== false,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST user error:", err);
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
      .from("org_users")
      .update({
        email: body.email,
        full_name: body.full_name,
        role: body.role,
        is_active: body.is_active,
      })
      .eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 });
    }

    const { error } = await supabase.from("org_users").delete().eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
