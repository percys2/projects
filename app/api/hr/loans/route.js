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

    const { data: loans, error } = await supabase
      .from("employee_loans")
      .select(`
        *,
        employee:employees(id, name)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ loans: loans || [] });
  } catch (err) {
    console.error("GET loans error:", err);
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

    const { employeeId, totalAmount, monthlyPayment, description, startDate } = body;

    if (!employeeId || !totalAmount || !monthlyPayment) {
      return NextResponse.json({ error: "Campos requeridos: empleado, monto total, pago mensual" }, { status: 400 });
    }

    const { data: loan, error } = await supabase
      .from("employee_loans")
      .insert({
        org_id: orgId,
        employee_id: employeeId,
        total_amount: parseFloat(totalAmount),
        monthly_payment: parseFloat(monthlyPayment),
        remaining_amount: parseFloat(totalAmount),
        paid_amount: 0,
        description: description || null,
        start_date: startDate || new Date().toISOString().split("T")[0],
        status: "activo",
        created_by: userId,
      })
      .select(`
        *,
        employee:employees(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ loan });
  } catch (err) {
    console.error("POST loan error:", err);
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
    const supabase = supabaseAdmin;
    const body = await req.json();

    const { id, action, paymentAmount } = body;

    if (!id) {
      return NextResponse.json({ error: "ID del prestamo requerido" }, { status: 400 });
    }

    if (action === "payment") {
      const { data: loan, error: fetchError } = await supabase
        .from("employee_loans")
        .select("*")
        .eq("id", id)
        .eq("org_id", orgId)
        .single();

      if (fetchError) throw fetchError;

      const payment = paymentAmount || Math.min(loan.monthly_payment, loan.remaining_amount);
      const newRemaining = Math.max(0, loan.remaining_amount - payment);
      const newPaid = loan.paid_amount + payment;
      const newStatus = newRemaining <= 0 ? "pagado" : "activo";

      const { error: paymentError } = await supabase
        .from("loan_payments")
        .insert({
          org_id: orgId,
          loan_id: id,
          amount: payment,
          created_by: userId,
        });

      if (paymentError) console.error("Payment record error:", paymentError);

      const { data: updatedLoan, error: updateError } = await supabase
        .from("employee_loans")
        .update({
          remaining_amount: newRemaining,
          paid_amount: newPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("org_id", orgId)
        .select(`
          *,
          employee:employees(id, name)
        `)
        .single();

      if (updateError) throw updateError;

      return NextResponse.json({ loan: updatedLoan });
    }

    return NextResponse.json({ error: "Accion no valida" }, { status: 400 });
  } catch (err) {
    console.error("PUT loan error:", err);
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
      return NextResponse.json({ error: "ID del prestamo requerido" }, { status: 400 });
    }

    const { error } = await supabase
      .from("employee_loans")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE loan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}