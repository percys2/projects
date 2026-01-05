import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ 
        error: context.error, 
        branches: [],
        debug: { stage: "getOrgContext", error: context.error }
      }, { status: 200 });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: stockItems, error: stockError } = await supabase
      .from("current_stock")
      .select("*")
      .eq("org_id", orgId)
      .gt("stock", 0);

    if (stockError) {
      return NextResponse.json({ 
        error: stockError.message, 
        branches: [],
        debug: { 
          stage: "query", 
          error: stockError.message,
          details: stockError.details,
          hint: stockError.hint,
          code: stockError.code,
          orgId
        }
      }, { status: 200 });
    }

    if (!stockItems || stockItems.length === 0) {
      return NextResponse.json({
        success: true,
        branches: [],
        totalProducts: 0,
        debug: {
          stage: "no_data",
          orgId,
          message: "No se encontraron productos con stock > 0"
        }
      });
    }

    const sampleItem = stockItems[0];
    const columns = Object.keys(sampleItem);
    
    const branchIdKey = columns.find(c => c.toLowerCase().includes('branch') && c.toLowerCase().includes('id')) || 'branch_id';
    const branchNameKey = columns.find(c => c.toLowerCase().includes('branch') && c.toLowerCase().includes('name')) || 'branch_name';

    const branchMap = new Map();
    for (const item of stockItems) {
      const branchId = item[branchIdKey];
      const branchName = item[branchNameKey] || item.branch || "Sin nombre";
      
      if (!branchId) continue;
      
      if (!branchMap.has(branchId)) {
        branchMap.set(branchId, {
          id: branchId,
          name: branchName,
          productCount: 0,
          totalStock: 0,
        });
      }
      const branch = branchMap.get(branchId);
      branch.productCount += 1;
      branch.totalStock += item.stock || 0;
    }

    const branches = Array.from(branchMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return NextResponse.json({
      success: true,
      branches,
      totalProducts: stockItems.length,
      debug: {
        columns,
        sampleItem,
        branchIdKey,
        branchNameKey,
        orgId
      }
    });

  } catch (err) {
    console.error("BRANCHES WITH STOCK ERROR:", err);
    return NextResponse.json({ 
      error: err.message, 
      branches: [],
      debug: { stage: "catch", error: err.message }
    }, { status: 200 });
  }
}
