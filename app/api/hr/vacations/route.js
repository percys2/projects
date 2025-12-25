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

    const { data: requests, error } = await supabaseAdmin
      .from("vacation_requests")
      .select(`*, employee:employees(id, name, position, hire_date)`)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests: requests || [] });
  } catch (err) {
    console.error("GET vacations error:", err);
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
    const body = await req.json();
    const { employeeId, startDate, endDate, days, type, notes } = body;

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Empleado y fechas requeridos" }, { status: 400 });
    }

    const { data: request, error } = await supabaseAdmin
      .from("vacation_requests")
      .insert({
        org_id: orgId,
        employee_id: employeeId,
        start_date: startDate,
        end_date: endDate,
        days: days || 1,
        type: type || "vacaciones",
        status: "pendiente",
        notes: notes || null,
        created_by: userId,
      })
      .select(`*, employee:employees(id, name, position)`)
      .single();

    if (error) throw error;

    return NextResponse.json({ request });
  } catch (err) {
    console.error("POST vacation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "ID y estado requeridos" }, { status: 400 });
    }

    const updateData = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === "aprobado") {
      updateData.approved_by = userId;
      updateData.approved_at = new Date().toISOString();
    }

    const { data: request, error } = await supabaseAdmin
      .from("vacation_requests")
      .update(updateData)
      .eq("id", id)
      .eq("org_id", orgId)
      .select(`*, employee:employees(id, name, position)`)
      .single();

    if (error) throw error;

    return NextResponse.json({ request });
  } catch (err) {
    console.error("PUT vacation error:", err);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID requerido" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("vacation_requests")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE vacation error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
