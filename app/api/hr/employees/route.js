import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import { employeeSchema, employeeUpdateSchema, validateRequest } from "@/src/lib/validation/schemas";
import { rateLimit } from "@/src/lib/middleware/rateLimit";
import { logAuditEvent, AuditActions } from "@/src/lib/audit/auditLog";
import * as Sentry from "@sentry/nextjs";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: employees, error } = await supabase
      .from("employees")
      .select("*")
      .eq("org_id", orgId)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ employees: employees || [] });
  } catch (err) {
    Sentry.captureException(err);
    console.error("HR GET error:", err);
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

    const rateLimitResult = rateLimit(`hr:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(employeeSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const employeeData = {
      org_id: orgId,
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone,
      cedula: validation.data.cedula,
      inss_number: validation.data.inss_number,
      position: validation.data.position,
      department: validation.data.department,
      salary: validation.data.salary,
      hire_date: validation.data.hire_date,
      contract_type: validation.data.contract_type,
      status: validation.data.status || "activo",
      address: validation.data.address,
      emergency_contact: validation.data.emergency_contact,
      emergency_phone: validation.data.emergency_phone,
      bank_account: validation.data.bank_account,
      bank_name: validation.data.bank_name,
      vacation_days_used: validation.data.vacation_days_used || 0,
    };

    const { data: employee, error } = await supabase
      .from("employees")
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.EMPLOYEE_CREATE,
      resourceType: "employee",
      resourceId: employee.id,
      metadata: { name: employee.name },
    });

    return NextResponse.json({ employee });
  } catch (err) {
    Sentry.captureException(err);
    console.error("HR POST error:", err);
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

    const rateLimitResult = rateLimit(`hr:${orgId}`, 50, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Por favor intente más tarde." },
        { status: 429, headers: { "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString() } }
      );
    }

    const body = await req.json();
    const validation = validateRequest(employeeUpdateSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.errors },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;

    const updateData = {
      name: validation.data.name,
      email: validation.data.email,
      phone: validation.data.phone,
      cedula: validation.data.cedula,
      inss_number: validation.data.inss_number,
      position: validation.data.position,
      department: validation.data.department,
      salary: validation.data.salary,
      hire_date: validation.data.hire_date,
      contract_type: validation.data.contract_type,
      status: validation.data.status,
      address: validation.data.address,
      emergency_contact: validation.data.emergency_contact,
      emergency_phone: validation.data.emergency_phone,
      bank_account: validation.data.bank_account,
      bank_name: validation.data.bank_name,
      vacation_days_used: validation.data.vacation_days_used,
    };

    const { data: employee, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", validation.data.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    await logAuditEvent({
      userId,
      orgId,
      action: AuditActions.EMPLOYEE_UPDATE,
      resourceType: "employee",
      resourceId: employee.id,
      metadata: { name: employee.name },
    });

    return NextResponse.json({ employee });
  } catch (err) {
    Sentry.captureException(err);
    console.error("HR PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
