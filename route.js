import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

// GET - List branches for an organization
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

    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ branches: branches || [] });
  } catch (err) {
    console.error("Branches GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();
    const orgSlug = req.headers.get("x-org-slug") || body.orgSlug;
    const { name, address, phone, is_active } = body;

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

    const { data: branch, error } = await supabase
      .from("branches")
      .insert({
        org_id: org.id,
        name,
        address: address || null,
        phone: phone || null,
        is_active: is_active !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ branch, success: true });
  } catch (err) {
    console.error("Branch POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();
    const orgSlug = req.headers.get("x-org-slug");
    const { id, name, address, phone, is_active } = body;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing branch id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (phone !== undefined) updateData.phone = phone;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: branch, error } = await supabase
      .from("branches")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ branch, success: true });
  } catch (err) {
    console.error("Branch PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const body = await req.json();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = body;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing branch id" }, { status: 400 });
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
      .from("branches")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Branch DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
