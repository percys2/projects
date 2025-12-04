import { NextResponse } from "next/server";
import { createClient } from "@/src/lib/supabase/server";

export async function GET(request) {
  try {
    const supabase = await createClient();
    const orgSlug = request.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error } = await supabase
      .from("organizations")
      .select("*")
      .eq("slug", orgSlug)
      .single();

    if (error) throw error;

    return NextResponse.json({ organization: org });
  } catch (err) {
    console.error("GET organization error:", err);
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

    const { error } = await supabase
      .from("organizations")
      .update({
        name: body.name,
        legal_name: body.legal_name,
        tax_id: body.tax_id,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        country: body.country,
        currency: body.currency,
        logo_url: body.logo_url,
      })
      .eq("id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT organization error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
