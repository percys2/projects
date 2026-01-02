import { NextResponse } from "next/server";
import { supabaseAdmin, createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const branchId = req.headers.get("x-branch-id");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const body = await req.json();
    const { client_id, client_name, factura, payment_method, notes, total, items, user_name } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    let userId = null;
    let userName = user_name || null;
    try {
      const authClient = await createServerSupabaseClient();
      const { data: { user } } = await authClient.auth.getUser();
      if (user) {
        userId = user.id;
        if (!userName) {
          userName = user.user_metadata?.full_name || user.email?.split('@')[0] || null;
        }
      }
    } catch (authErr) {
      console.log("Could not get authenticated user:", authErr.message);
    }

    const baseSaleData = {
      org_id: org.id,
      branch_id: branchId || null,
      client_id: client_id || null,
      client_name: client_name || null,
      factura: factura,
      payment_method: payment_method || "cash",
      notes: notes || null,
      total: Number(total),
    };

    let sale = null;
    let saleError = null;

    const { data: saleWithUser, error: errorWithUser } = await supabase
      .from("sales")
      .insert({ ...baseSaleData, user_id: userId, user_name: userName })
      .select()
      .single();

    if (errorWithUser && errorWithUser.code === "PGRST204") {
      console.log("user_id/user_name columns not found, retrying without them");
      const { data: saleBasic, error: errorBasic } = await supabase
        .from("sales")
        .insert(baseSaleData)
        .select()
        .single();
      sale = saleBasic;
      saleError = errorBasic;
    } else {
      sale = saleWithUser;
      saleError = errorWithUser;
    }

    if (saleError) {
      console.error("Sale insert error:", saleError);
      throw saleError;
    }

    const saleItems = items.map((item) => ({
      sale_id: sale.id,
      product_id: item.product_id,
      quantity: Number(item.quantity),
      price: Number(item.price),
      cost: Number(item.cost || 0),
      subtotal: Number(item.quantity) * Number(item.price),
    }));

    const { error: itemsError } = await supabase.from("sales_items").insert(saleItems);

    if (itemsError) {
      console.error("Sales items insert error:", itemsError);
      await supabase.from("sales").delete().eq("id", sale.id);
      throw itemsError;
    }

    for (const item of items) {
      const { error: movError } = await supabase.from("inventory_movements").insert({
        org_id: org.id,
        product_id: item.product_id,
        type: "salida",
        qty: Number(item.quantity),
        from_branch: branchId || null,
        to_branch: null,
        cost: Number(item.cost || 0),
        price: Number(item.price),
        reference: `Venta Factura #${factura}`,
        created_by: userId,
      });

      if (movError) {
        console.error("Inventory movement error:", movError);
      }

      const { error: kardexError } = await supabase.from("kardex").insert({
        org_id: org.id,
        product_id: item.product_id,
        movement_type: "SALE",
        quantity: -Number(item.quantity),
        branch_id: branchId || null,
        from_branch: branchId || null,
        to_branch: null,
        cost_unit: Number(item.cost || 0),
        total: Number(item.cost || 0) * Number(item.quantity),
        reference: `Venta Factura #${factura}`,
        created_by: userId,
      });

      if (kardexError) {
        console.error("Kardex insert error:", kardexError);
      }
    }

    return NextResponse.json({
      success: true,
      sale: {
        ...sale,
        invoice: factura,
      },
    });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}