import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: stockData, error: invError } = await supabase
      .from("current_stock")
      .select("*")
      .eq("org_id", orgId);

    if (invError) throw invError;

    const inventory = (stockData || []).map(item => ({
      id: `${item.product_id}-${item.branch_id || 'no-branch'}`,
      quantity: item.stock,
      cost: item.cost,
      price: item.price,
      expiration_date: item.expiration_date,
      lot_number: item.lot_number,
      products: {
        id: item.product_id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        unit_weight: item.unit_weight,
        min_stock: item.min_stock
      },
      branches: item.branch_id ? {
        id: item.branch_id,
        name: item.branch_name
      } : null
    }));

    const { data: categories } = await supabase
      .from("categories")
      .select("name")
      .eq("org_id", orgId);

    const { data: branches } = await supabase
      .from("branches")
      .select("id, name")
      .eq("org_id", orgId);

    return NextResponse.json({
      inventory,
      categories: categories?.map((c) => c.name) ?? [],
      branches: branches || [],
    });

  } catch (err) {
    console.error("API INVENTORY ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    // Check if product has any movement history
    const { data: movements, error: movCheckError } = await supabase
      .from("inventory_movements")
      .select("id")
      .eq("product_id", body.productId)
      .eq("org_id", orgId)
      .limit(1);

    if (movCheckError) {
      console.log("Movement check error:", movCheckError);
    }

    // Check if product has any kardex history
    const { data: kardexRecords, error: kardexCheckError } = await supabase
      .from("kardex")
      .select("id")
      .eq("product_id", body.productId)
      .eq("org_id", orgId)
      .limit(1);

    if (kardexCheckError) {
      console.log("Kardex check error:", kardexCheckError);
    }

    // If product has history, block deletion
    const hasMovements = movements && movements.length > 0;
    const hasKardex = kardexRecords && kardexRecords.length > 0;

    if (hasMovements || hasKardex) {
      return NextResponse.json(
        { 
          error: "No se puede eliminar este producto porque tiene movimientos históricos (entradas/salidas). El historial debe conservarse. Contacte al administrador si necesita desactivar este producto." 
        },
        { status: 400 }
      );
    }

    // Only delete product if it has no history
    const { error: prodError } = await supabase
      .from("products")
      .delete()
      .eq("id", body.productId)
      .eq("org_id", orgId);

    if (prodError) throw prodError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Inventory DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
