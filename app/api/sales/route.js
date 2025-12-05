import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("sales")
      .select(`*, clients(*), sales_items(*, products(id, name, sku, category))`)
      .eq("org_id", org.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) query = query.gte("fecha", startDate);
    if (endDate) query = query.lte("fecha", endDate);

    const { data: sales, error } = await query;
    if (error) throw error;

    const totals = (sales || []).reduce((acc, sale) => {
      acc.totalRevenue += Number(sale.total) || 0;
      acc.totalMargin += Number(sale.margen) || 0;
      acc.totalItems += (sale.sales_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      acc.totalCost += (sale.sales_items || []).reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.quantity || 0)), 0);
      return acc;
    }, { totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });

    return NextResponse.json({ success: true, sales: sales || [], count: sales?.length || 0, totals });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const body = await req.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase.from("sales").update(updateData).eq("id", id).eq("org_id", org.id).select().single();
    if (error) throw error;

    return NextResponse.json({ success: true, sale: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    if (!orgSlug) return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
    if (!org) return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const body = await req.json();
    const { id } = body;

    await supabase.from("sales_items").delete().eq("sale_id", id);
    const { error } = await supabase.from("sales").delete().eq("id", id).eq("org_id", org.id);
    if (error) throw error;

    return NextResponse.json({ success: true, message: "Venta eliminada" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
