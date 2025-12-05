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

    const { data: assets, error } = await supabase
      .from("assets")
      .select("*")
      .eq("org_id", org.id)
      .order("acquisition_date", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ assets: assets || [] });
  } catch (err) {
    console.error("Assets GET error:", err);
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

    const assetData = {
      org_id: org.id,
      name: body.name,
      category: body.category || null,
      acquisition_date: body.acquisition_date,
      acquisition_cost: body.acquisition_cost || 0,
      useful_life_months: body.useful_life_months || 60,
      salvage_value: body.salvage_value || 0,
      depreciation_method: body.depreciation_method || "straight_line",
      account_asset_id: body.account_asset_id || null,
      status: body.status || "active",
    };

    const { data: asset, error } = await supabase
      .from("assets")
      .insert(assetData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ asset }, { status: 201 });
  } catch (err) {
    console.error("Assets POST error:", err);
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
      name: body.name,
      category: body.category || null,
      acquisition_date: body.acquisition_date,
      acquisition_cost: body.acquisition_cost || 0,
      useful_life_months: body.useful_life_months || 60,
      salvage_value: body.salvage_value || 0,
      depreciation_method: body.depreciation_method || "straight_line",
      account_asset_id: body.account_asset_id || null,
      status: body.status || "active",
    };

    const { data: asset, error } = await supabase
      .from("assets")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ asset });
  } catch (err) {
    console.error("Assets PUT error:", err);
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
      .from("assets")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Assets DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}