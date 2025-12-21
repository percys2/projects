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
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const branchId = searchParams.get("branchId");
    const limit = Number(searchParams.get("limit") || 50);
    const offset = Number(searchParams.get("offset") || 0);

    let query = supabase
      .from("cash_register_closings")
      .select("*")
      .eq("org_id", org.id)
      .order("closing_time", { ascending: false })
      .range(offset, offset + limit - 1);

    if (date) {
      const dayStart = new Date(`${date}T00:00:00-06:00`).toISOString();
      const dayEnd = new Date(`${date}T23:59:59.999-06:00`).toISOString();
      query = query.gte("closing_time", dayStart).lte("closing_time", dayEnd);
    }

    if (startDate) {
      const start = new Date(`${startDate}T00:00:00-06:00`).toISOString();
      query = query.gte("closing_time", start);
    }

    if (endDate) {
      const end = new Date(`${endDate}T23:59:59.999-06:00`).toISOString();
      query = query.lte("closing_time", end);
    }

    if (branchId) {
      query = query.eq("branch_id", branchId);
    }

    const { data: closings, error } = await query;

    if (error) throw error;

    const totals = (closings || []).reduce(
      (acc, closing) => {
        acc.totalExpected += Number(closing.expected_total) || 0;
        acc.totalCounted += Number(closing.counted_amount) || 0;
        acc.totalDifference += Number(closing.difference) || 0;
        acc.totalSales += Number(closing.sales_count) || 0;
        return acc;
      },
      { totalExpected: 0, totalCounted: 0, totalDifference: 0, totalSales: 0 }
    );

    return NextResponse.json({
      success: true,
      closings: closings || [],
      count: closings?.length || 0,
      totals,
    });
  } catch (error) {
    console.error("Error fetching cash closings:", error);
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

    const closingData = {
      org_id: org.id,
      branch_id: body.branch_id || null,
      user_id: body.user_id || null,
      user_name: body.user_name || "Cajero",
      opening_time: body.opening_time,
      closing_time: body.closing_time || new Date().toISOString(),
      opening_amount: Number(body.opening_amount) || 0,
      total_entries: Number(body.total_entries) || 0,
      total_exits: Number(body.total_exits) || 0,
      expected_total: Number(body.expected_total) || 0,
      counted_amount: Number(body.counted_amount) || 0,
      difference: Number(body.difference) || 0,
      sales_count: Number(body.sales_count) || 0,
      movements_count: Number(body.movements_count) || 0,
      notes: body.notes || "",
      movements: body.movements || [],
    };

    const { data: closing, error } = await supabase
      .from("cash_register_closings")
      .insert(closingData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      closing,
      message: "Cierre de caja guardado exitosamente",
    });
  } catch (error) {
    console.error("Error saving cash closing:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
