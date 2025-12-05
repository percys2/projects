import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

/* =====================================
   GET — LISTAR ITEMS POR VENTA (o todos)
   ===================================== */
export async function GET(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;

    const { searchParams } = new URL(req.url);
    const sale_id = searchParams.get("sale_id");

    let query = supabaseAdmin
      .from("sales_items")
      .select("*")
      .eq("org_id", orgId);

    if (sale_id) {
      query = query.eq("sale_id", sale_id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Sales items GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =====================================
   POST — INSERT ITEMS (uno o varios)
   ===================================== */
export async function POST(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const items = Array.isArray(body) ? body : [body];

    const payload = items.map((item) => ({
      ...item,
      org_id: orgId,
      subtotal: Number(item.quantity) * Number(item.price),
    }));

    const { data, error } = await supabaseAdmin
      .from("sales_items")
      .insert(payload)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Sales items POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =====================================
   PUT — ACTUALIZAR ITEM
   ===================================== */
export async function PUT(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id, ...updateData } = body;

    if (updateData.quantity && updateData.price) {
      updateData.subtotal =
        Number(updateData.quantity) * Number(updateData.price);
    }

    const { data, error } = await supabaseAdmin
      .from("sales_items")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Sales items PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/* =====================================
   DELETE — ELIMINAR ITEM
   ===================================== */
export async function DELETE(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const body = await req.json();

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { id } = body;

    const { error } = await supabaseAdmin
      .from("sales_items")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Sales items DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
