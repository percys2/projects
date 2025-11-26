import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase/server";

export async function POST(req) {
  const body = await req.json();


  const {
    orgId,
    productId,
    branchId,
    type,       // 'entrada' | 'salida' | 'traslado'
    qty,
    cost,
    price,
    from_branch,
    to_branch,
    notes
  } = body;

  if (!orgId || !productId || !type || !qty || !branchId) {
    return NextResponse.json(
      { error: "Datos incompletos para registrar movimiento" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("inventory_movements").insert([
    {
      org_id: orgId,
      product_id: productId,
      branch_id: branchId,
      type,
      qty,
      cost,
      price,
      from_branch,
      to_branch,
      notes
    }
  ]);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
