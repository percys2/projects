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
    const { id, restoreInventory } = body;

    // 1. Load the sale to get branch_id
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select("id, org_id, branch_id")
      .eq("id", id)
      .eq("org_id", org.id)
      .single();

    if (saleError || !sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    // 2. Load sales_items BEFORE deleting (needed for inventory restoration)
    const { data: items } = await supabase
      .from("sales_items")
      .select("product_id, quantity, price, cost")
      .eq("sale_id", id);

    // 3. If restoreInventory flag is true, insert reverse movements
    if (restoreInventory && items && items.length > 0) {
      for (const item of items) {
        // Insert reverse inventory_movement (entrada = stock comes back)
        const { error: movError } = await supabase.from("inventory_movements").insert({
          org_id: org.id,
          product_id: item.product_id,
          type: "entrada",
          qty: Number(item.quantity),
          from_branch: null,
          to_branch: sale.branch_id,
          cost: item.cost,
          price: item.price,
          reference: `Anulación Venta #${sale.id}`,
          created_by: null,
        });
        if (movError) {
          console.error("Error inserting reverse inventory_movement:", movError);
        }

        // Insert reverse kardex entry
        const { error: kardexError } = await supabase.from("kardex").insert({
          org_id: org.id,
          product_id: item.product_id,
          movement_type: "SALE_CANCEL",
          quantity: Number(item.quantity),
          branch_id: sale.branch_id,
          from_branch: null,
          to_branch: sale.branch_id,
          cost_unit: Number(item.cost) || 0,
          total: Number(item.cost || 0) * Number(item.quantity || 0),
          reference: `Anulación Venta #${sale.id}`,
          created_by: null,
        });
        if (kardexError) {
          console.error("Error inserting reverse kardex:", kardexError);
        }
      }
    }

    // 4. Delete sales_items and sale
    await supabase.from("sales_items").delete().eq("sale_id", id);
    const { error } = await supabase.from("sales").delete().eq("id", id).eq("org_id", org.id);
    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: restoreInventory ? "Venta anulada e inventario restaurado" : "Venta eliminada" 
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
