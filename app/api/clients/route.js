import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR CLIENTES
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("org_id", org_id)
    .order("created_at", { ascending: false });

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   POST — CREAR CLIENTE
   ===================================== */
export async function POST(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const payload = {
    ...body,
    org_id,
  };

  const { data, error } = await supabase
    .from("clients")
    .insert(payload)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data, 201);
}

/* =====================================
   PUT — ACTUALIZAR CLIENTE
   ===================================== */
export async function PUT(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id, ...updateData } = body;

  const { data, error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", id)
    .eq("org_id", org_id)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   DELETE — ELIMINAR CLIENTE
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
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("org_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  return respond({ message: "Client deleted" });
}
