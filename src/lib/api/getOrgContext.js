import { createServerSupabaseClient, supabaseAdmin } from "@/src/lib/supabase/server";

export async function getOrgContext(req) {
  try {
    const orgSlug = req.headers.get("x-org-slug");
    
    if (!orgSlug) {
      return { success: false, error: "Missing organization slug", status: 400 };
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Not authenticated", status: 401 };
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("id, name, slug")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return { success: false, error: "Organization not found", status: 404 };
    }

    const { data: membership, error: memberError } = await supabaseAdmin
      .from("organization_members")
      .select("id, role")
      .eq("org_id", org.id)
      .eq("user_id", user.id)
      .single();

    if (memberError || !membership) {
      return { success: false, error: "Access denied", status: 403 };
    }

    return { success: true, user, org, orgId: org.id, userId: user.id, role: membership.role };
  } catch (error) {
    console.error("getOrgContext error:", error);
    return { success: false, error: "Internal server error", status: 500 };
  }
}

export async function getOrgContextWithBranch(req) {
  const context = await getOrgContext(req);
  if (!context.success) return context;

  const branchId = req.headers.get("x-branch-id");
  if (!branchId) {
    return { success: false, error: "Missing branch ID", status: 400 };
  }

  const { data: branch, error: branchError } = await supabaseAdmin
    .from("branches")
    .select("id, name")
    .eq("id", branchId)
    .eq("org_id", context.orgId)
    .single();

  if (branchError || !branch) {
    return { success: false, error: "Branch not found", status: 404 };
  }

  return { ...context, branch, branchId: branch.id };
}
