import { respond } from "@/src/lib/core/respond";
import { getSlug } from "@/src/lib/core/getSlug";
import { getOrgIdFromSlug } from "@/src/lib/core/getOrgId";

/* =====================================
   GET — Obtener organización por slug
   ===================================== */
export async function GET(req) {
  const slug = getSlug(req);

  if (!slug) {
    return respond({ error: "Missing slug" }, 400);
  }

  const org_id = await getOrgIdFromSlug(slug);

  if (!org_id) {
    return respond({ error: "Organization not found" }, 404);
  }

  return respond({ org_id });
}
