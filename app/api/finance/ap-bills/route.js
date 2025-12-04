import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { postAPBillToGL } from "@/src/lib/services/journalService";

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { data: bills, error } = await supabase
      .from("ap_bills")
      .select(`
        *,
        suppliers (name)
      `)
      .eq("org_id", org.id)
      .order("date", { ascending: false });

    if (error) throw error;

    const billsWithSupplier = (bills || []).map((b) => ({
      ...b,
      supplier_name: b.suppliers?.name,
    }));

    return NextResponse.json({ bills: billsWithSupplier });
  } catch (err) {
    console.error("AP Bills GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = await createServerSupabaseClient();
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

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const billData = {
      org_id: org.id,
      supplier_id: body.supplier_id || null,
      date: body.date,
      due_date: body.due_date || null,
      reference: body.reference || null,
      total: body.total || 0,
      amount_paid: 0,
      status: "open",
      notes: body.notes || null,
    };

    const { data: bill, error: billError } = await supabase
      .from("ap_bills")
      .insert(billData)
      .select()
      .single();

    if (billError) throw billError;

    let itemsData = [];
    if (body.items && body.items.length > 0) {
      itemsData = body.items.map((item) => ({
        org_id: org.id,
        bill_id: bill.id,
        account_id: item.account_id || null,
        description: item.description || null,
        amount: parseFloat(item.amount) || 0,
      }));

      const { error: itemsError } = await supabase
        .from("ap_bill_items")
        .insert(itemsData);

      if (itemsError) {
        console.error("AP Bill Items insert error:", itemsError);
      }
    }

    try {
      const glItems = itemsData.length > 0 ? itemsData : [{ amount: bill.total, description: bill.notes || "Gasto" }];
      await postAPBillToGL(org.id, bill, glItems);
    } catch (glError) {
      console.error("GL posting error (non-blocking):", glError);
    }

    return NextResponse.json({ bill }, { status: 201 });
  } catch (err) {
    console.error("AP Bills POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const supabase = await createServerSupabaseClient();
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

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const updateData = {
      supplier_id: body.supplier_id || null,
      date: body.date,
      due_date: body.due_date || null,
      reference: body.reference || null,
      total: body.total || 0,
      notes: body.notes || null,
    };

    const { data: bill, error } = await supabase
      .from("ap_bills")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", org.id)
      .select()
      .single();

    if (error) throw error;

    if (body.items) {
      await supabase
        .from("ap_bill_items")
        .delete()
        .eq("bill_id", body.id);

      if (body.items.length > 0) {
        const itemsData = body.items.map((item) => ({
          org_id: org.id,
          bill_id: body.id,
          account_id: item.account_id || null,
          description: item.description || null,
          amount: parseFloat(item.amount) || 0,
        }));

        await supabase.from("ap_bill_items").insert(itemsData);
      }
    }

    return NextResponse.json({ bill });
  } catch (err) {
    console.error("AP Bills PUT error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const supabase = await createServerSupabaseClient();
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

    if (orgError || !org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    await supabase
      .from("ap_bill_items")
      .delete()
      .eq("bill_id", body.id);

    const { error } = await supabase
      .from("ap_bills")
      .delete()
      .eq("id", body.id)
      .eq("org_id", org.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("AP Bills DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
