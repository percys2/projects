import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function cleanSlug(slug) {
  return slug
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      firstName,
      lastName,
      organizationName,
      organizationSlug,
    } = body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !organizationName ||
      !organizationSlug
    ) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const safeSlug = cleanSlug(organizationSlug);

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // STEP 1 — Create user
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // STEP 2 — Profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        email,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Error al crear perfil: " + profileError.message },
        { status: 500 }
      );
    }

    // STEP 3 — Organization
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .insert({
        name: organizationName,
        slug: safeSlug,
      })
      .select()
      .single();

    if (orgError) {
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      if (orgError.code === "23505") {
        return NextResponse.json(
          { error: "El slug de organización ya está en uso." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Error al crear organización: " + orgError.message },
        { status: 500 }
      );
    }

    // STEP 4 — Membership
    const { error: membershipError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_id: orgData.id,
        user_id: userId,
        role: "admin",
      });

    if (membershipError) {
      await supabaseAdmin.from("organizations").delete().eq("id", orgData.id);
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
      await supabaseAdmin.auth.admin.deleteUser(userId);

      return NextResponse.json(
        { error: "Error al crear membresía: " + membershipError.message },
        { status: 500 }
      );
    }

    // SUCCESS
    return NextResponse.json({
      success: true,
      message: "Cuenta creada exitosamente",
      organizationSlug: orgData.slug,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
