import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = request.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id,name")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: users, error } = await supabase
      .from("org_users")
      .select("*")
      .eq("org_id", org.id)
      .order("full_name");

    if (error) throw error;

    return NextResponse.json({ users: users || [], orgName: org.name });
  } catch (err) {
    console.error("GET users error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = request.headers.get("x-org-slug");
    const body = await request.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!body.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id,name")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    // Check if user already exists in auth
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === body.email);

    let inviteSent = false;

    // If user doesn't exist in auth, send invitation email
    if (!existingUser) {
      const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(body.email, {
        data: {
          full_name: body.full_name,
          org_id: org.id,
          org_name: org.name,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${orgSlug}/dashboard`,
      });

      if (inviteError) {
        console.error("Invite error:", inviteError);
      } else {
        inviteSent = true;
      }
    }

    // Insert into org_users (only use columns that definitely exist)
    const { error: insertError } = await supabase.from("org_users").insert({
      org_id: org.id,
      email: body.email,
      full_name: body.full_name || null,
      role: body.role || "user",
      is_active: body.is_active !== false,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      inviteSent,
      message: inviteSent 
        ? `Invitación enviada a ${body.email}` 
        : existingUser 
          ? `Usuario ${body.email} agregado (ya tiene cuenta)`
          : `Usuario agregado (invitación no enviada - verificar configuración SMTP)`
    });
  } catch (err) {
    console.error("POST user error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = supabaseAdmin;
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
    const supabase = supabaseAdmin;
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