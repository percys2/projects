import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { productSchema, validateRequest } from "@/src/lib/validation/schemas";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .eq("org_id", orgId);

    if (error) throw error;
    return NextResponse.json({ products: products || [] });
  } catch (err) {
    console.error("Products GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    const validation = validateRequest(productSchema, body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid data", details: validation.errors }, { status: 400 });
    }

    const productData = {
      org_id: orgId,
      name: body.name,
      sku: body.sku,
      category: body.category,
      subcategory: body.subcategory || null,
      unit_weight: body.unitWeight || body.unit_weight || null,
      min_stock: body.minStock || body.min_stock || 0,
      cost: body.cost || 0,
      price: body.price || 0,
    };

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (productError) throw productError;
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    console.error("Products POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.sku !== undefined) updateData.sku = body.sku;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.subcategory !== undefined) updateData.subcategory = body.subcategory;
    if (body.unitWeight !== undefined || body.unit_weight !== undefined) {
      updateData.unit_weight = body.unitWeight || body.unit_weight;
    }
    if (body.minStock !== undefined || body.min_stock !== undefined) {
      updateData.min_stock = body.minStock || body.min_stock;
    }
    if (body.active !== undefined) updateData.active = body.active;
    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.expiresAt !== undefined || body.expires_at !== undefined) {
      updateData.expires_at = body.expiresAt || body.expires_at;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return NextResponse.json({ product });
  } catch (err) {
    console.error("Products PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", body.id)
      .eq("org_id", orgId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Products DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}