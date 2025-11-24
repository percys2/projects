import { respond } from "@/src/lib/core/respond";
import { parseBody } from "@/src/lib/core/parseBody";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";
import { supabase } from "@/src/lib/api/supabaseClient";

/* =====================================
   GET — OBTENER CONFIGURACIÓN
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);
  if (!slug) return respond({ error: "Missing slug" }, 400);

  const org_id = await getOrgIdFromSlug(slug);
  if (!org_id) return respond({ error: "Invalid organization" }, 404);

  const { data, error } = await supabase
    .from("organization_settings")
    .select("*")
    .eq("organization_id", org_id)
    .single();

  if (error && error.code !== "PGRST116") {
    return respond({ error: error.message }, 500);
  }

  // Si no existe configuración, devolver valores por defecto
  const defaultSettings = {
    organization_id: org_id,
    currency: "NIO",
    timezone: "America/Managua",
    language: "es",
    labor_config: {
      vacation_days_per_year: 30,
      aguinaldo_months_per_year: 1,
      severance_days_per_year: 30,
      severance_max_months: 5,
      inss_employee_rate: 0.07,
      inss_employer_rate: 0.19,
      ir_exempt_amount: 100000,
    },
  };

  return respond({ settings: data || defaultSettings });
}

/* =====================================
   PUT — ACTUALIZAR CONFIGURACIÓN
   ===================================== */
export async function PUT(req) {
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

  // Upsert: crear o actualizar
  const { data, error } = await supabase
    .from("organization_settings")
    .upsert(payload, {
      onConflict: "organization_id",
    })
    .select()
    .single();

  if (error) return respond({ error: error.message }, 500);

  return respond(data);
}
