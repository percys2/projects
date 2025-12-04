import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";

export async function GET(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = await params;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: employee, error } = await supabase
      .from("employees")
      .select("*")
      .eq("id", id)
      .eq("org_id", org.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Employee not found" }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ employee });
  } catch (err) {
    console.error("Employee GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = await params;
    const body = await req.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

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
      .eq("id", id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ employee });
  } catch (err) {
    console.error("Employee PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");
    const { id } = await params;

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ error: "Missing employee id" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { error } = await supabase
      .from("employees")
      .delete()
      .eq("id", id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Employee DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
