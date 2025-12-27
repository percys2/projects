import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token requerido" }, { status: 400 });
    }

    // Obtener usuario autenticado
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Debes iniciar sesión para aceptar la invitación" }, { status: 401 });
    }

    // Buscar invitación válida
    const { data: invitation, error: invError } = await supabaseAdmin
      .from("org_invitations")
      .select("*, organizations(name, slug)")
      .eq("token", token)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (invError || !invitation) {
      return NextResponse.json({ error: "Invitación inválida o expirada" }, { status: 400 });
    }

    // Verificar que el email coincide
    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ 
        error: `Esta invitación es para ${invitation.email}. Inicia sesión con ese email.` 
      }, { status: 403 });
    }

    // Verificar que el usuario no pertenece a otra organización
    const { data: existingMembership } = await supabaseAdmin
      .from("organization_members")
      .select("org_id")
      .eq("user_id", user.id)
      .single();

    if (existingMembership) {
      return NextResponse.json({ 
        error: "Ya perteneces a una organización. Un usuario solo puede pertenecer a una organización." 
      }, { status: 400 });
    }

    // Agregar usuario a la organización
    const { error: memberError } = await supabaseAdmin
      .from("organization_members")
      .insert({
        org_id: invitation.org_id,
        user_id: user.id,
        role: invitation.role,
      });

    if (memberError) throw memberError;

    // Marcar invitación como aceptada
    await supabaseAdmin
      .from("org_invitations")
      .update({ accepted_at: new Date().toISOString() })
      .eq("id", invitation.id);

    return NextResponse.json({ 
      success: true,
      organization: invitation.organizations,
      message: `Te has unido a ${invitation.organizations.name}`
    });
  } catch (err) {
    console.error("Accept invitation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
