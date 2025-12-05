import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContextWithBranch } from "@/src/lib/api/getOrgContext";

export async function POST(req) {
  try {
    // Securely derive org and branch context from authenticated session
    const context = await getOrgContextWithBranch(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, branchId } = context;
    const body = await req.json();

    const {
      productId,
      type,       // 'entrada' | 'salida' | 'traslado'
      qty,
      cost,
      price,
      from_branch,
      to_branch,
      notes
    } = body;

    if (!productId || !type || !qty) {
      return NextResponse.json(
        { error: "Datos incompletos para registrar movimiento" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin.from("inventory_movements").insert([
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
  } catch (err) {
    console.error("Movements POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
