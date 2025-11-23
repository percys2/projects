import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR ITEMS POR VENTA (o todos)
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { searchParams } = new URL(req.url);
  const sale_id = searchParams.get("sale_id");

  let query = supabase
    .from("sales_items")
    .select("*")
    .eq("organization_id", org_id);

  if (sale_id) {
    query = query.eq("sale_id", sale_id);
  }

  const { data, error } = await query;

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   POST — INSERT ITEMS (uno o varios)
   ===================================== */
export async function POST(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const items = Array.isArray(body) ? body : [body];

  const payload = items.map((item) => ({
    ...item,
    organization_id: org_id,
    subtotal: Number(item.quantity) * Number(item.price),
  }));

  const { data, error } = await supabase
    .from("sales_items")
    .insert(payload)
    .select();

  if (error) return respond({ error: error.message }, 500);

  return respond(data, 201);
}

/* =====================================
   PUT — ACTUALIZAR ITEM
   ===================================== */
export async function PUT(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id, ...updateData } = body;

  if (updateData.quantity && updateData.price) {
    updateData.subtotal =
      Number(updateData.quantity) * Number(updateData.price);
  }

  const { data, error } = await supabase
    .from("sales_items")
    .update(updateData)
    .eq("id", id)
    .eq("organization_id", org_id)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   DELETE — ELIMINAR ITEM
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
    .from("sales_items")
    .delete()
    .eq("id", id)
    .eq("organization_id", org_id);

  if (error) return respond({ error: error.message }, 500);

  return respond({ message: "Item deleted" });
}
