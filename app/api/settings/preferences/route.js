import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: prefs, error } = await supabase
      .from("system_preferences")
      .select("*")
      .eq("org_id", org.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    return NextResponse.json({ preferences: prefs || {} });
  } catch (err) {
    console.error("GET preferences error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");
    const body = await request.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: existing } = await supabase
      .from("system_preferences")
      .select("id")
      .eq("org_id", org.id)
      .single();

    const prefsData = {
      org_id: org.id,
      language: body.language,
      timezone: body.timezone,
      date_format: body.date_format,
      decimal_separator: body.decimal_separator,
      thousands_separator: body.thousands_separator,
      low_stock_threshold: body.low_stock_threshold,
      enable_notifications: body.enable_notifications,
      enable_email_alerts: body.enable_email_alerts,
      auto_logout_minutes: body.auto_logout_minutes,
      require_manager_pin: body.require_manager_pin,
      manager_pin: body.manager_pin,
    };

    if (existing) {
      const { error } = await supabase
        .from("system_preferences")
        .update(prefsData)
        .eq("id", existing.id);

      if (error) throw error;
    } else {
      const { error } = await supabase.from("system_preferences").insert(prefsData);

      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT preferences error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
