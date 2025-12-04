import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Not authenticated", user: null, role: null },
        { status: 401 }
      );
    }

    let role = "admin";

    if (orgSlug) {
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", orgSlug)
        .single();

      if (org) {
        const { data: orgUser } = await supabase
          .from("org_users")
          .select("role, is_active")
          .eq("org_id", org.id)
          .eq("user_id", user.id)
          .single();

        if (orgUser && orgUser.is_active) {
          role = orgUser.role;
        }
      }
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.email,
      },
      role,
    });
  } catch (err) {
    console.error("Auth me error:", err);
    return NextResponse.json(
      { error: err.message, user: null, role: "admin" },
      { status: 500 }
    );
  }
}
