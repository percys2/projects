import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: clients, error } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", org.id)
      .order("first_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json(clients || []);
  } catch (err) {
    console.error("Clients GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const clientData = {
      org_id: org.id,
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      municipio: body.municipio,
      animal_type: body.animal_type,
      sales_stage: body.sales_stage || "prospecto",
    };

    const { data: client, error } = await supabase
      .from("clients")
      .insert(clientData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(client);
  } catch (err) {
    console.error("Clients POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updateData = {
      first_name: body.first_name,
      last_name: body.last_name,
      phone: body.phone,
      address: body.address,
      city: body.city,
      municipio: body.municipio,
      animal_type: body.animal_type,
      sales_stage: body.sales_stage,
    };

    const { data: client, error } = await supabase
      .from("clients")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(client);
  } catch (err) {
    console.error("Clients PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Clients DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}