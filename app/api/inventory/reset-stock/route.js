import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();
    const { branchId } = body;

    if (!branchId) {
      return NextResponse.json(
        { error: "Debe seleccionar una sucursal" },
        { status: 400 }
      );
    }

    const { data: allStock, error: allStockError } = await supabase
      .from("current_stock")
      .select("product_id, stock, name, cost, branch_id, branch_name")
      .eq("org_id", orgId)
      .gt("stock", 0);

    const { data: stockItems, error: stockError } = await supabase
      .from("current_stock")
      .select("product_id, stock, name, cost, branch_id, branch_name")
      .eq("org_id", orgId)
      .eq("branch_id", branchId)
      .gt("stock", 0);

    if (stockError) throw stockError;

    if (!stockItems || stockItems.length === 0) {
      const uniqueBranches = [...new Set((allStock || []).map(s => JSON.stringify({ id: s.branch_id, name: s.branch_name })))].map(s => JSON.parse(s));
      return NextResponse.json({
        success: false,
        message: "No hay productos con stock para resetear en esta sucursal",
        processed: 0,
        debug: {
          branchIdRecibido: branchId,
          orgIdUsado: orgId,
          totalProductosConStock: allStock?.length || 0,
          sucursalesConStock: uniqueBranches,
          nota: "El branchId enviado no coincide con ninguna sucursal que tenga stock"
        }
      });
    }

    const results = { success: [], failed: [] };

    for (const item of stockItems) {
      try {
        const { error: movError } = await supabase
          .from("inventory_movements")
          .insert({
            org_id: orgId,
            product_id: item.product_id,
            qty: item.stock,
            type: "salida",
            cost: item.cost || 0,
            reference: "[RESET MASIVO] Inventario reseteado a 0",
            from_branch: branchId,
            to_branch: null,
            created_by: userId,
          });

        if (movError) {
          results.failed.push({ product: item.name, error: movError.message });
          continue;
        }

        const { error: kardexError } = await supabase
          .from("kardex")
          .insert({
            org_id: orgId,
            product_id: item.product_id,
            movement_type: "RESET",
            quantity: -item.stock,
            branch_id: branchId,
            from_branch: branchId,
            to_branch: null,
            cost_unit: item.cost || 0,
            total: (item.cost || 0) * item.stock,
            reference: "[RESET MASIVO] Inventario reseteado a 0",
            created_by: userId,
          });

        if (kardexError) {
          console.error("Kardex insert error:", kardexError);
        }

        const { error: rpcError } = await supabase.rpc("decrease_inventory", {
          p_org_id: orgId,
          p_product_id: item.product_id,
          p_branch_id: branchId,
          p_quantity: item.stock,
        });

        if (rpcError) {
          results.failed.push({ product: item.name, error: rpcError.message });
          continue;
        }

        results.success.push({ product: item.name, qty: item.stock });
      } catch (err) {
        results.failed.push({ product: item.name, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Se resetearon ${results.success.length} productos a 0`,
      processed: results.success.length,
      failed: results.failed.length,
      details: results,
    });

  } catch (err) {
    console.error("RESET STOCK ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}