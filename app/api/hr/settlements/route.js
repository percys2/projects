import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employee_id");
    const status = searchParams.get("status");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    let query = supabase
      .from("employee_settlements")
      .select("*")
      .eq("org_id", org.id)
      .order("settlement_date", { ascending: false });

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: settlements, error } = await query;

    if (error) throw error;

    return NextResponse.json({ settlements: settlements || [] });
  } catch (err) {
    console.error("Settlements GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
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

    const { data: existingAdvances, error: advancesError } = await supabase
      .from("employee_settlements")
      .select("amount_to_pay")
      .eq("employee_id", body.employee_id)
      .eq("org_id", org.id)
      .eq("status", "pagado")
      .in("settlement_type", ["adelanto", "parcial"]);

    if (advancesError) throw advancesError;

    const previousAdvances = existingAdvances?.reduce((sum, s) => sum + (parseFloat(s.amount_to_pay) || 0), 0) || 0;

    const settlementData = {
      org_id: org.id,
      employee_id: body.employee_id,
      settlement_type: body.settlement_type || "final",
      employee_name: body.employee_name,
      employee_cedula: body.employee_cedula,
      salary_at_settlement: body.salary,
      hire_date: body.hire_date,
      settlement_date: body.settlement_date || new Date().toISOString().split("T")[0],
      months_worked: body.months_worked || 0,
      years_worked: body.years_worked || 0,
      vacation_days_accrued: body.vacation_days_accrued || 0,
      vacation_days_used: body.vacation_days_used || 0,
      vacation_days_paid: body.vacation_days_paid || 0,
      vacation_pay: body.vacation_pay || 0,
      aguinaldo_months: body.aguinaldo_months || 0,
      aguinaldo_amount: body.aguinaldo_amount || 0,
      severance_years: body.severance_years || 0,
      severance_amount: body.severance_amount || 0,
      other_deductions: body.other_deductions || 0,
      other_additions: body.other_additions || 0,
      total_amount: body.total_amount,
      previous_advances: previousAdvances,
      amount_to_pay: body.settlement_type === "final" 
        ? (body.total_amount - previousAdvances) 
        : body.amount_to_pay || body.total_amount,
      status: body.status || "pendiente",
      payment_method: body.payment_method,
      notes: body.notes,
    };

    const { data: settlement, error } = await supabase
      .from("employee_settlements")
      .insert(settlementData)
      .select()
      .single();

    if (error) throw error;

    if (body.settlement_type === "final" && body.update_employee_status) {
      await supabase
        .from("employees")
        .update({ status: "inactivo" })
        .eq("id", body.employee_id)
        .eq("org_id", org.id);
    }

    return NextResponse.json({ settlement });
  } catch (err) {
    console.error("Settlements POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = supabaseAdmin;
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

    const updateData = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.payment_date !== undefined) updateData.payment_date = body.payment_date;
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: settlement, error } = await supabase
      .from("employee_settlements")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ settlement });
  } catch (err) {
    console.error("Settlements PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = supabaseAdmin;
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
      .from("employee_settlements")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Settlements DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
