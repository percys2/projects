import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — LISTAR ASISTENCIAS
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("organization_id", org_id)
    .order("date", { ascending: false });

  if (error) return respond({ error: error.message }, 500);

  return respond({ attendance: data || [] });
}

/* =====================================
   POST — REGISTRAR ASISTENCIA
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
    organization_id: org_id,
  };

  // Upsert: si ya existe registro para ese empleado y fecha, actualizar
  const { data, error } = await supabase
    .from("attendance")
    .upsert(payload, {
      onConflict: "employee_id,date,organization_id",
    })
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data, 201);
}
