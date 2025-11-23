import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR PRODUCTOS
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("organization_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   POST — CREAR PRODUCTO
   ===================================== */
export async function POST(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const payload = { ...body, organization_id: org_id };

  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data, 201);
}

/* =====================================
   PUT — ACTUALIZAR PRODUCTO
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
    .from("products")
    .update(updateData)
    .eq("id", id)
    .eq("organization_id", org_id)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   DELETE — ELIMINAR PRODUCTO
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
    .from("products")
    .delete()
    .eq("id", id)
    .eq("organization_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  return respond({ message: "Deleted successfully" });
}
