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

    if (!body.password || body.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
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

    let authUserId = null;

    if (existingUser) {
      // User already exists in auth, just use their ID
      authUserId = existingUser.id;
    } else {
      // Create user with password directly (no email required)
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: body.email,
        password: body.password,
        email_confirm: true, // Auto-confirm email so they can login immediately
        user_metadata: {
          full_name: body.full_name,
          org_id: org.id,
          org_name: org.name,
        },
      });

      if (createError) {
        console.error("Create user error:", createError);
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
      
      authUserId = newUser?.user?.id;
    }

    // Insert into org_users
    const { error: insertError } = await supabase.from("org_users").insert({
      org_id: org.id,
      user_id: authUserId,
      email: body.email,
      full_name: body.full_name || null,
      role: body.role || "user",
      is_active: body.is_active !== false,
    });

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      message: existingUser 
        ? `Usuario ${body.email} agregado a la organizacion`
        : `Usuario ${body.full_name || body.email} creado. Ya puede iniciar sesion con su correo y contraseña.`
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