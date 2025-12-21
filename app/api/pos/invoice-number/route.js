import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const branchId = searchParams.get("branchId") || null;

    const { data, error } = await supabase.rpc("get_next_invoice_number", {
      p_org_id: org.id,
      p_branch_id: branchId,
    });

    if (error) {
      console.error("Error getting invoice number:", error);
      
      const { data: counter, error: selectError } = await supabase
        .from("invoice_counters")
        .select("last_number")
        .eq("org_id", org.id)
        .is("branch_id", branchId)
        .single();

      if (selectError || !counter) {
        const { data: newCounter, error: insertError } = await supabase
          .from("invoice_counters")
          .insert({ org_id: org.id, branch_id: branchId, last_number: 1 })
          .select("last_number")
          .single();

        if (insertError) {
          return NextResponse.json({ 
            success: true, 
            invoiceNumber: 1,
            formatted: "1"
          });
        }

        return NextResponse.json({
          success: true,
          invoiceNumber: newCounter.last_number,
          formatted: String(newCounter.last_number),
        });
      }

      const newNumber = (counter.last_number || 0) + 1;
      await supabase
        .from("invoice_counters")
        .update({ last_number: newNumber, updated_at: new Date().toISOString() })
        .eq("org_id", org.id)
        .is("branch_id", branchId);

      return NextResponse.json({
        success: true,
        invoiceNumber: newNumber,
        formatted: String(newNumber),
      });
    }

    return NextResponse.json({
      success: true,
      invoiceNumber: data,
      formatted: String(data),
    });
  } catch (error) {
    console.error("Error in invoice number API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const body = await req.json();
    const branchId = body.branchId || null;

    const { data: counter } = await supabase
      .from("invoice_counters")
      .select("last_number")
      .eq("org_id", org.id)
      .is("branch_id", branchId)
      .single();

    const currentNumber = counter?.last_number || 0;

    return NextResponse.json({
      success: true,
      currentNumber,
      nextNumber: currentNumber + 1,
    });
  } catch (error) {
    console.error("Error in invoice number API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
