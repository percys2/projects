import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = org.id;
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const limit = Number(searchParams.get("limit") || 100);
    const offset = Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("sales")
      .select(`
        id,
        org_id,
        branch_id,
        factura,
        fecha,
        client_id,
        user_id,
        subtotal,
        descuento,
        iva,
        total,
        margen,
        potential_sale,
        status,
        created_at,
        clients (
          id,
          first_name,
          last_name,
          phone,
          address,
          city
        ),
        sales_items (
          id,
          product_id,
          quantity,
          price,
          subtotal,
          cost,
          margin,
          products (id, name, sku, category)
        )
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (startDate) query = query.gte("fecha", startDate);
    if (endDate) query = query.lte("fecha", endDate);

    const { data: sales, error } = await query;

    if (error) throw error;

    const totals = (sales || []).reduce((acc, sale) => {
      if (sale.status !== "cancelled") {
        acc.totalRevenue += Number(sale.total) || 0;
        acc.totalMargin += Number(sale.margen) || 0;
        acc.totalItems += (sale.sales_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
        acc.totalCost += (sale.sales_items || []).reduce((sum, item) => sum + (Number(item.cost || 0) * Number(item.quantity || 0)), 0);
      }
      return acc;
    }, { totalRevenue: 0, totalItems: 0, totalMargin: 0, totalCost: 0 });

    return NextResponse.json({
      success: true,
      sales: sales || [],
      count: sales?.length || 0,
      totals,
    });
  } catch (error) {
    console.error("Sales API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = org.id;
    const body = await req.json();
    const { id, ...updateData } = body;

    const { data, error } = await supabase
      .from("sales")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, sale: data });
  } catch (error) {
    console.error("Sales update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ANULAR VENTA - Restaura inventario y marca como cancelada
export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const orgId = org.id;
    const body = await req.json();
    const { id, action } = body;

    // Obtener la venta con sus items
    const { data: sale, error: saleError } = await supabase
      .from("sales")
      .select(`
        id, branch_id, status,
        sales_items (id, product_id, quantity)
      `)
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (saleError || !sale) {
      return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 });
    }

    if (sale.status === "cancelled") {
      return NextResponse.json({ error: "Esta venta ya fue anulada" }, { status: 400 });
    }

    // Si action es "cancel", anular la venta y restaurar inventario
    if (action === "cancel") {
      // Restaurar inventario para cada producto
      for (const item of sale.sales_items || []) {
        if (item.product_id && item.quantity > 0) {
          // Buscar el registro de inventario
          const { data: invRecord } = await supabase
            .from("inventory")
            .select("id, quantity")
            .eq("org_id", orgId)
            .eq("product_id", item.product_id)
            .eq("branch_id", sale.branch_id)
            .single();

          if (invRecord) {
            // Sumar la cantidad de vuelta al inventario
            await supabase
              .from("inventory")
              .update({ quantity: invRecord.quantity + item.quantity })
              .eq("id", invRecord.id);
          } else {
            // Si no existe registro, crear uno nuevo
            await supabase
              .from("inventory")
              .insert({
                org_id: orgId,
                branch_id: sale.branch_id,
                product_id: item.product_id,
                quantity: item.quantity,
              });
          }

          // Registrar movimiento de inventario (entrada por anulación)
          await supabase.from("inventory_movements").insert({
            org_id: orgId,
            branch_id: sale.branch_id,
            product_id: item.product_id,
            type: "entrada",
            quantity: item.quantity,
            reference: `Anulación venta ${id}`,
            notes: "Inventario restaurado por anulación de venta",
          });
        }
      }

      // Marcar la venta como cancelada (no eliminar para mantener historial)
      const { error: updateError } = await supabase
        .from("sales")
        .update({ status: "cancelled" })
        .eq("id", id)
        .eq("org_id", orgId);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        message: "Venta anulada e inventario restaurado" 
      });
    }

    // Si action es "delete", eliminar permanentemente (solo para admins)
    if (action === "delete") {
      await supabase.from("sales_items").delete().eq("sale_id", id);
      const { error } = await supabase.from("sales").delete().eq("id", id).eq("org_id", orgId);

      if (error) throw error;

      return NextResponse.json({ success: true, message: "Venta eliminada permanentemente" });
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  } catch (error) {
    console.error("Sales cancel/delete error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}