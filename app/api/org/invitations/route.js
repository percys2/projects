import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import crypto from "crypto";

// GET - Listar invitaciones pendientes
export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { data: invitations, error } = await supabaseAdmin
      .from("org_invitations")
      .select("*")
      .eq("org_id", context.orgId)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ invitations });
  } catch (err) {
    console.error("GET invitations error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST - Crear nueva invitación
export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const body = await req.json();
    const { email, role = "member" } = body;

    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
    }

    // Verificar que el usuario es admin/owner
    const { data: membership } = await supabaseAdmin
      .from("organization_members")
      .select("role")
      .eq("org_id", context.orgId)
      .eq("user_id", context.userId)
      .single();

    if (!membership || !["owner", "admin"].includes(membership.role)) {
      return NextResponse.json({ error: "No tienes permisos para invitar usuarios" }, { status: 403 });
    }

    // Verificar si ya existe una invitación pendiente
    const { data: existing } = await supabaseAdmin
      .from("org_invitations")
      .select("id")
      .eq("org_id", context.orgId)
      .eq("email", email.toLowerCase())
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (existing) {
      return NextResponse.json({ error: "Ya existe una invitación pendiente para este email" }, { status: 400 });
    }

    // Verificar si el usuario ya es miembro
    const { data: existingUser } = await supabaseAdmin
      .from("auth.users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingUser) {
      const { data: existingMember } = await supabaseAdmin
        .from("organization_members")
        .select("id")
        .eq("org_id", context.orgId)
        .eq("user_id", existingUser.id)
        .single();

      if (existingMember) {
        return NextResponse.json({ error: "Este usuario ya es miembro de la organización" }, { status: 400 });
      }
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Crear invitación
    const { data: invitation, error } = await supabaseAdmin
      .from("org_invitations")
      .insert({
        org_id: context.orgId,
        email: email.toLowerCase(),
        role,
        token,
        invited_by: context.userId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Obtener nombre de la organización
    const { data: org } = await supabaseAdmin
      .from("organizations")
      .select("name")
      .eq("id", context.orgId)
      .single();

    // TODO: Enviar email con el link de invitación
    // Por ahora retornamos el link para que lo copien manualmente
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/accept?token=${token}`;

    return NextResponse.json({ 
      invitation,
      inviteLink,
      message: `Invitación creada. Comparte este link con ${email}: ${inviteLink}`
    });
  } catch (err) {
    console.error("POST invitation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Cancelar invitación
export async function DELETE(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { searchParams } = new URL(req.url);
    const invitationId = searchParams.get("id");

    if (!invitationId) {
      return NextResponse.json({ error: "ID de invitación requerido" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("org_invitations")
      .delete()
      .eq("id", invitationId)
      .eq("org_id", context.orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE invitation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}