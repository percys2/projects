import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      org_id,
      product_id,
      type,         // entrada | salida | traslado
      qty,
      cost,
      expires_at,
      lot,
      from_branch,
      to_branch,
    } = body;

    if (!org_id || !product_id || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("inventory_movements")
      .insert([
        {
          org_id,
          product_id,
          type,
          qty,
          cost,
          expires_at,
          lot,
          from_branch,
          to_branch,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ movement: data });
  } catch (err) {
    console.error("Movement error:", err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
