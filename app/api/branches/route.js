import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }
    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: branches, error } = await supabase
      .from("branches")
      .select("*")
      .eq("org_id", orgId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ branches: branches || [] });
  } catch (err) {
    console.error("Branches GET error:", err);
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

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: "El nombre de la sucursal es requerido" }, { status: 400 });
    }

    const branchData = {
      org_id: orgId,
      name: body.name.trim(),
      address: body.address || null,
      phone: body.phone || null,
      is_active: body.is_active !== false,
    };

    const { data: branch, error } = await supabase
      .from("branches")
      .insert(branchData)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ branch }, { status: 201 });
  } catch (err) {
    console.error("Branches POST error:", err);
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
      return NextResponse.json({ error: "Missing branch ID" }, { status: 400 });
    }

    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.address !== undefined) updateData.address = body.address;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const { data: branch, error } = await supabase
      .from("branches")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ branch });
  } catch (err) {
    console.error("Branches PUT error:", err);
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
      return NextResponse.json({ error: "Missing branch ID" }, { status: 400 });
    }

    const { data: inventory } = await supabase
      .from("inventory")
      .select("id")
      .eq("branch_id", body.id)
      .limit(1);

    if (inventory && inventory.length > 0) {
      return NextResponse.json({ 
        error: "No se puede eliminar la sucursal porque tiene inventario asociado. Desactivela en su lugar." 
      }, { status: 400 });
    }

    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("id", body.id)
      .eq("org_id", orgId);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Branches DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}