import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Create Supabase client for Route Handlers (correct version)
function getSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      cookies: {
        get() {},
        set() {},
        remove() {}
      }
    }
  );
}

// ---------------------------------------------
// GET — LIST EMPLOYEES
// ---------------------------------------------
export async function GET(req) {
  try {
    const supabase = getSupabase();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { data: employees, error } = await supabase
      .from("employees")
      .select("*")
      .eq("org_id", org.id)
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ employees: employees || [] });
  } catch (err) {
    console.error("HR GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------
// POST — CREATE EMPLOYEE
// ---------------------------------------------
export async function POST(req) {
  try {
    const supabase = getSupabase();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const employeeData = {
      org_id: org.id,
      name: body.name,
      email: body.email,
      phone: body.phone,
      cedula: body.cedula,
      inss_number: body.inss_number,
      position: body.position,
      department: body.department,
      salary: body.salary,
      hire_date: body.hire_date,
      contract_type: body.contract_type,
      status: body.status || "activo",
      address: body.address,
      emergency_contact: body.emergency_contact,
      emergency_phone: body.emergency_phone,
      bank_account: body.bank_account,
      bank_name: body.bank_name,
      vacation_days_used: body.vacation_days_used || 0,
    };

    const { data: employee, error } = await supabase
      .from("employees")
      .insert(employeeData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ employee });
  } catch (err) {
    console.error("HR POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------
// PUT — UPDATE EMPLOYEE
// ---------------------------------------------
export async function PUT(req) {
  try {
    const supabase = getSupabase();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const updateData = {
      name: body.name,
      email: body.email,
      phone: body.phone,
      cedula: body.cedula,
      inss_number: body.inss_number,
      position: body.position,
      department: body.department,
      salary: body.salary,
      hire_date: body.hire_date,
      contract_type: body.contract_type,
      status: body.status,
      address: body.address,
      emergency_contact: body.emergency_contact,
      emergency_phone: body.emergency_phone,
      bank_account: body.bank_account,
      bank_name: body.bank_name,
      vacation_days_used: body.vacation_days_used,
    };

    const { data: employee, error } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ employee });
  } catch (err) {
    console.error("HR PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------
// DELETE — REMOVE EMPLOYEE
// ---------------------------------------------
export async function DELETE(req) {
  try {
    const supabase = getSupabase();
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug || !body.id) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("HR DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
