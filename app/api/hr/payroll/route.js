
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

    const { data: payrolls, error } = await supabaseAdmin
      .from("payroll_history")
      .select("*")
      .eq("org_id", orgId)
      .order("period_year", { ascending: false })
      .order("period_month", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ payrolls: payrolls || [] });
  } catch (err) {
    console.error("GET payroll error:", err);
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
    const { periodMonth, periodYear, periodLabel, totals, items } = body;

    if (!periodMonth || !periodYear || !totals || !items) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { data: existingPayroll } = await supabaseAdmin
      .from("payroll_history")
      .select("id")
      .eq("org_id", orgId)
      .eq("period_month", periodMonth)
      .eq("period_year", periodYear)
      .single();

    let payrollId;

    if (existingPayroll) {
      const { error: updateError } = await supabaseAdmin
        .from("payroll_history")
        .update({
          period_label: periodLabel,
          total_employees: totals.totalEmployees,
          total_gross: totals.totalGross,
          total_inss: totals.totalInss,
          total_ir: totals.totalIr,
          total_net: totals.totalNet,
          total_employer_inss: totals.totalEmployerInss,
          total_aguinaldo_provision: totals.totalAguinaldoProvision,
          total_vacation_provision: totals.totalVacationProvision,
          total_employer_cost: totals.totalEmployerCost,
        })
        .eq("id", existingPayroll.id);

      if (updateError) throw updateError;
      payrollId = existingPayroll.id;

      await supabaseAdmin
        .from("payroll_history_items")
        .delete()
        .eq("payroll_id", payrollId);
    } else {
      const { data: newPayroll, error: insertError } = await supabaseAdmin
        .from("payroll_history")
        .insert({
          org_id: orgId,
          period_month: periodMonth,
          period_year: periodYear,
          period_label: periodLabel,
          total_employees: totals.totalEmployees,
          total_gross: totals.totalGross,
          total_inss: totals.totalInss,
          total_ir: totals.totalIr,
          total_net: totals.totalNet,
          total_employer_inss: totals.totalEmployerInss,
          total_aguinaldo_provision: totals.totalAguinaldoProvision,
          total_vacation_provision: totals.totalVacationProvision,
          total_employer_cost: totals.totalEmployerCost,
          status: "guardado",
          created_by: userId,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      payrollId = newPayroll.id;
    }

    if (items && items.length > 0) {
      const itemsToInsert = items.map((item) => ({
        org_id: orgId,
        payroll_id: payrollId,
        employee_id: item.employeeId,
        employee_name: item.employeeName,
        employee_cedula: item.employeeCedula,
        employee_position: item.employeePosition,
        employee_department: item.employeeDepartment,
        salary: item.salary,
        commissions: item.commissions,
        total_gross: item.totalGross,
        inss: item.inss,
        ir: item.ir,
        net_salary: item.netSalary,
        employer_inss: item.employerInss,
        aguinaldo_provision: item.aguinaldoProvision,
        vacation_provision: item.vacationProvision,
        total_employer_cost: item.totalEmployerCost,
      }));

      const { error: itemsError } = await supabaseAdmin
        .from("payroll_history_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return NextResponse.json({ success: true, payrollId });
  } catch (err) {
    console.error("POST payroll error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
