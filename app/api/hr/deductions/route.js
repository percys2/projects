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

    const { data: deductions, error } = await supabase
      .from("employee_deductions")
      .select(`
        *,
        employee:employees(id, name)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ deductions: deductions || [] });
  } catch (err) {
    console.error("GET deductions error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    const { employeeId, amount, type, description, isActive } = body;

    if (!employeeId || !amount) {
      return NextResponse.json({ error: "Campos requeridos: empleado, monto" }, { status: 400 });
    }

    const { data: deduction, error } = await supabase
      .from("employee_deductions")
      .insert({
        org_id: orgId,
        employee_id: employeeId,
        amount: parseFloat(amount),
        type: type || "otro",
        description: description || null,
        is_active: isActive !== false,
        created_by: userId,
      })
      .select(`
        *,
        employee:employees(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ deduction });
  } catch (err) {
    console.error("POST deduction error:", err);
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

    const { id, isActive, amount, type, description } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de la deduccion requerido" }, { status: 400 });
    }

    const updateData = { updated_at: new Date().toISOString() };
    if (isActive !== undefined) updateData.is_active = isActive;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (type !== undefined) updateData.type = type;
    if (description !== undefined) updateData.description = description;

    const { data: deduction, error } = await supabase
      .from("employee_deductions")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", orgId)
      .select(`
        *,
        employee:employees(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ deduction });
  } catch (err) {
    console.error("PUT deduction error:", err);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de la deduccion requerido" }, { status: 400 });
    }

    const { error } = await supabase
      .from("employee_deductions")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE deduction error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
