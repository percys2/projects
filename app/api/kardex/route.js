import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";
import * as Sentry from "@sentry/nextjs";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ success: false, error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const productId = req.headers.get("x-product-id");
    const branchId = req.headers.get("x-branch-id");
    const movementType = req.headers.get("x-movement-type");
    const search = req.headers.get("x-search") || "";

    const url = new URL(req.url);
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    // Map UI filter values (Spanish lowercase) to database values (English uppercase)
    const movementTypeMap = {
      entrada: ["ENTRY", "ADJUSTMENT_IN", "PURCHASE"],
      salida: ["EXIT", "ADJUSTMENT_OUT"],
      transferencia: ["TRANSFER", "TRANSFER_OUT", "TRANSFER_IN"],
      venta: ["SALE", "SALE_CANCEL"],
      ajuste: ["ADJUSTMENT_IN", "ADJUSTMENT_OUT", "ADJUSTMENT", "RESET"],
    };

    let query = supabase
      .from("kardex_view")
      .select("*")
      .eq("org_id", orgId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (productId && productId !== "all") query = query.eq("product_id", productId);
    if (branchId && branchId !== "all") {
      query = query.or(`from_branch.eq.${branchId},to_branch.eq.${branchId},branch_id.eq.${branchId}`);
    }
    if (movementType && movementType !== "all") {
      const dbTypes = movementTypeMap[movementType];
      if (dbTypes && dbTypes.length > 0) {
        query = query.in("movement_type", dbTypes);
      }
    }
    if (search) query = query.or(`product_name.ilike.%${search}%,reference.ilike.%${search}%,user_email.ilike.%${search}%`);
    if (startDate) query = query.gte("created_at", `${startDate}T00:00:00`);
    if (endDate) query = query.lte("created_at", `${endDate}T23:59:59`);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}