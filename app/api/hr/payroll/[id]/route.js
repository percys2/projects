import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req, { params }) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const { id } = await params;

    const { data: payroll, error: payrollError } = await supabaseAdmin
      .from("payroll_history")
      .select("*")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (payrollError) {
      if (payrollError.code === "PGRST116") {
        return NextResponse.json({ error: "Planilla no encontrada" }, { status: 404 });
      }
      throw payrollError;
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from("payroll_history_items")
      .select("*")
      .eq("payroll_id", id)
      .eq("org_id", orgId)
      .order("employee_name", { ascending: true });

    if (itemsError) throw itemsError;

    return NextResponse.json({
      payroll: {
        ...payroll,
        items: items || [],
      },
    });
  } catch (err) {
    console.error("GET payroll by id error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}