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

    const { data: existingClient, error: findError } = await supabase
      .from("clients")
      .select("*")
      .eq("org_id", orgId)
      .ilike("first_name", "menudeo")
      .single();

    if (existingClient) {
      const { data: receivables } = await supabase
        .from("ar_receivables")
        .select("*")
        .eq("org_id", orgId)
        .eq("client_id", existingClient.id)
        .order("created_at", { ascending: false });

      const totalDebt = (receivables || []).reduce((sum, r) => {
        const balance = (r.total || 0) - (r.amount_paid || 0);
        return sum + (balance > 0 ? balance : 0);
      }, 0);

      const totalPaid = (receivables || []).reduce((sum, r) => sum + (r.amount_paid || 0), 0);

      return NextResponse.json({
        client: existingClient,
        receivables: receivables || [],
        stats: {
          totalDebt,
          totalPaid,
          totalReceivables: receivables?.length || 0,
          pendingReceivables: (receivables || []).filter(r => r.status !== "paid").length,
        },
      });
    }

    const { data: newClient, error: createError } = await supabase
      .from("clients")
      .insert({
        org_id: orgId,
        first_name: "Menudeo",
        last_name: "Credito",
        phone: "",
        address: "",
        city: "",
        municipio: "",
        animal_type: "",
        sales_stage: "cliente",
      })
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      client: newClient,
      receivables: [],
      stats: {
        totalDebt: 0,
        totalPaid: 0,
        totalReceivables: 0,
        pendingReceivables: 0,
      },
      created: true,
    });

  } catch (err) {
    console.error("Menudeo client GET error:", err);
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

    const { data: menudeoClient, error: findError } = await supabase
      .from("clients")
      .select("id")
      .eq("org_id", orgId)
      .ilike("first_name", "menudeo")
      .single();

    if (!menudeoClient) {
      return NextResponse.json({ error: "Cliente Menudeo no encontrado. Acceda primero a la pantalla de Menudeo para crearlo." }, { status: 404 });
    }

    const { amount, notes, date } = body;

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "El monto debe ser mayor a 0" }, { status: 400 });
    }

    const { data: pendingReceivables, error: recError } = await supabase
      .from("ar_receivables")
      .select("*")
      .eq("org_id", orgId)
      .eq("client_id", menudeoClient.id)
      .neq("status", "paid")
      .order("created_at", { ascending: true });

    if (recError) throw recError;

    if (!pendingReceivables || pendingReceivables.length === 0) {
      return NextResponse.json({ error: "No hay cuentas pendientes para abonar" }, { status: 400 });
    }

    let remainingAmount = parseFloat(amount);
    const updatedReceivables = [];

    for (const receivable of pendingReceivables) {
      if (remainingAmount <= 0) break;

      const balance = (receivable.total || 0) - (receivable.amount_paid || 0);
      if (balance <= 0) continue;

      const paymentAmount = Math.min(remainingAmount, balance);
      const newAmountPaid = (receivable.amount_paid || 0) + paymentAmount;
      const newStatus = newAmountPaid >= receivable.total ? "paid" : "partial";

      const { data: updated, error: updateError } = await supabase
        .from("ar_receivables")
        .update({
          amount_paid: newAmountPaid,
          status: newStatus,
        })
        .eq("id", receivable.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating receivable:", updateError);
        continue;
      }

      updatedReceivables.push({
        receivable: updated,
        paymentAmount,
      });

      remainingAmount -= paymentAmount;
    }

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        org_id: orgId,
        client_id: menudeoClient.id,
        amount: parseFloat(amount),
        date: date || new Date().toISOString().split("T")[0],
        method: "efectivo",
        direction: "in",
        notes: notes || "Abono Menudeo",
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    return NextResponse.json({
      success: true,
      totalApplied: parseFloat(amount) - remainingAmount,
      remainingAmount,
      updatedReceivables,
      payment,
    });

  } catch (err) {
    console.error("Menudeo abono POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
