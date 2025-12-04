import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
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

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ products: products || [] });
  } catch (err) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
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

    const productData = {
      org_id: org.id,
      name: body.name,
      sku: body.sku,
      category: body.category,
      unit_weight: body.unitWeight || body.unit_weight || null,
      min_stock: body.minStock || body.min_stock || 0,
    };

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (productError) throw productError;

    const branchId = body.branchId || body.branch_id;
    if (branchId) {
      const inventoryData = {
        org_id: org.id,
        product_id: product.id,
        branch_id: branchId,
        quantity: 0,
        cost: body.cost || 0,
        price: body.price || 0,
        expiration_date: body.expiresAt || body.expiration_date || null,
        lot_number: body.lot || body.lot_number || null,
      };

      const { error: invError } = await supabase
        .from("inventory")
        .insert(inventoryData);

      if (invError) {
        console.error("Inventory insert error:", invError);
      }
    }

    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("Products POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = await createServerSupabaseClient();
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
      sku: body.sku,
      category: body.category,
      unit_weight: body.unitWeight || body.unit_weight,
      min_stock: body.minStock || body.min_stock,
    };

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Products PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createServerSupabaseClient();
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
      .from("products")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Products DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
