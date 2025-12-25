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
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    let query = supabaseAdmin
      .from("employee_attendance")
      .select(`*, employee:employees(id, name, position)`)
      .eq("org_id", orgId)
      .order("date", { ascending: false });

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query.gte("date", startDate).lte("date", endDate);
    }

    const { data: attendance, error } = await query;
    if (error) throw error;

    return NextResponse.json({ attendance: attendance || [] });
  } catch (err) {
    console.error("GET attendance error:", err);
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
    const { employeeId, date, status, hoursWorked, overtimeHours, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "Empleado y fecha requeridos" }, { status: 400 });
    }

    const { data: attendance, error } = await supabaseAdmin
      .from("employee_attendance")
      .upsert({
        org_id: orgId,
        employee_id: employeeId,
        date,
        status: status || "presente",
        hours_worked: parseFloat(hoursWorked) || 8,
        overtime_hours: parseFloat(overtimeHours) || 0,
        notes: notes || null,
        created_by: userId,
      }, { onConflict: "org_id,employee_id,date" })
      .select(`*, employee:employees(id, name, position)`)
      .single();

    if (error) throw error;

    return NextResponse.json({ attendance });
  } catch (err) {
    console.error("POST attendance error:", err);
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
      .from("employee_attendance")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE attendance error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}