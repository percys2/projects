import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR VENTAS
   ===================================== */
export async function GET(req) {
  const orgId = req.headers.get("x-org-id");
  if (!orgId) return respond({ error: "Missing org ID" }, 400);

  const { data, error } = await supabase
    .from("sales")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   POST — CREAR VENTA
   ===================================== */
export async function POST(req) {
  const orgId = req.headers.get("x-org-id");
  if (!orgId) return respond({ error: "Missing org ID" }, 400);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const payload = {
    ...body,
    org_id: orgId,
  };

  const { data, error } = await supabase
    .from("sales")
    .insert(payload)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data, 201);
}

/* =====================================
   PUT — ACTUALIZAR VENTA
   ===================================== */
export async function PUT(req) {
  const orgId = req.headers.get("x-org-id");
  if (!orgId) return respond({ error: "Missing org ID" }, 400);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id, ...updateData } = body;

  const { data, error } = await supabase
    .from("sales")
    .update(updateData)
    .eq("id", id)
    .eq("org_id", orgId)
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}

/* =====================================
   DELETE — ELIMINAR VENTA
   ===================================== */
export async function DELETE(req) {
  const orgId = req.headers.get("x-org-id");
  if (!orgId) return respond({ error: "Missing org ID" }, 400);

  const body = await parseBody(req);
  if (!body) return respond({ error: "Invalid JSON body" }, 400);

  const { id } = body;

  const { error } = await supabase
    .from("sales")
    .delete()
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) return respond({ error: error.message }, 500);

  return respond({ message: "Deleted successfully" });
}

