import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR USUARIOS DE LA ORGANIZACIÓN
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      id,
      role,
      user_id,
      profiles (
        id,
        full_name,
        email
      )
    `)
    .eq("org_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  // Transformar datos para el frontend
  const users = data.map((member) => ({
    id: member.id,
    user_id: member.user_id,
    full_name: member.profiles?.full_name || "",
    email: member.profiles?.email || "",
    role: member.role,
  }));

  return respond({ users });
}

/* =====================================
   POST — AGREGAR USUARIO A LA ORGANIZACIÓN
   ===================================== */
export async function POST(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  // Nota: En producción, esto debería crear el usuario en auth.users primero
  // Por ahora, asumimos que el usuario ya existe
  return respond({ message: "User invitation feature coming soon" }, 501);
}

/* =====================================
   PUT — ACTUALIZAR ROL DE USUARIO
   ===================================== */
export async function PUT(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id, role } = body;

  const { data, error } = await supabase
    .from("organization_members")
    .update({ role })
    .eq("id", id)
    .eq("org_id", org_id)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   DELETE — ELIMINAR USUARIO DE LA ORGANIZACIÓN
   ===================================== */
export async function DELETE(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id } = body;

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  return respond({ message: "User removed successfully" });
}
