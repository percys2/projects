import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

function getTodayManagua() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Managua" }).format(new Date());
}

function getTimeManagua() {
  return new Intl.DateTimeFormat("es-NI", { 
    timeZone: "America/Managua",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(new Date());
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const userId = req.headers.get("x-user-id") || null;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    const {
      type,
      branchId,
      items,
      notes,
      providerName,
      providerInvoice,
      from_branch,
      to_branch,
      userName = "Usuario",
    } = body;

    if (!orgSlug)
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    if (!type || !items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json(
        { error: "Missing required fields (type, items[])" },
        { status: 400 }
      );

    const { data: org } = await supabase
      .from("organizations")
      .select("id,name,ruc,address,phone")
      .eq("slug", orgSlug)
      .single();

    if (!org)
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    const orgId = org.id;

    const { data: lastMovement } = await supabase
      .from("inventory_movements")
      .select("consecutivo")
      .eq("org_id", orgId)
      .not("consecutivo", "is", null)
      .order("consecutivo", { ascending: false })
      .limit(1)
      .single();

    const nextConsecutivo = (lastMovement?.consecutivo || 0) + 1;

    let branchName = null;
    if (branchId) {
      const { data: branch } = await supabase
        .from("branches")
        .select("name")
        .eq("id", branchId)
        .single();
      branchName = branch?.name;
    }

    let fromBranch = null;
    let toBranch = null;

    if (type === "entrada") toBranch = branchId || to_branch;
    if (type === "salida") fromBranch = branchId || from_branch;
    if (type === "transferencia") {
      fromBranch = from_branch;
      toBranch = to_branch;
    }
    if (type === "ajuste") {
      fromBranch = branchId;
      toBranch = branchId;
    }

    const batchId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const movementsToInsert = items.map((item) => ({
      org_id: orgId,
      product_id: item.productId,
      qty: Number(item.qty),
      type: type,
      cost: item.cost || null,
      reference: notes || null,
      from_branch: fromBranch,
      to_branch: toBranch,
      created_by: userId,
      consecutivo: nextConsecutivo,
      batch_id: batchId,
      provider_name: providerName || null,
      provider_invoice: providerInvoice || null,
      created_at: createdAt,
    }));

    const { data: movements, error } = await supabase
      .from("inventory_movements")
      .insert(movementsToInsert)
      .select("*,products:product_id(id,name,sku,unit)");

    if (error) throw error;

    for (const item of items) {
      if (type === "entrada") {
        await supabase.rpc("increase_inventory", {
          p_org_id: orgId,
          p_product_id: item.productId,
          p_branch_id: toBranch,
          p_quantity: Number(item.qty),
        });
      }

      if (type === "salida") {
        await supabase.rpc("decrease_inventory", {
          p_org_id: orgId,
          p_product_id: item.productId,
          p_branch_id: fromBranch,
          p_quantity: Number(item.qty),
        });
      }

      if (type === "transferencia") {
        await supabase.rpc("transfer_inventory", {
          p_org_id: orgId,
          p_product_id: item.productId,
          p_from_branch: fromBranch,
          p_to_branch: toBranch,
          p_quantity: Number(item.qty),
        });
      }
    }

    const printData = {
      consecutivo: nextConsecutivo,
      batchId,
      type,
      date: getTodayManagua(),
      time: getTimeManagua(),
      userName,
      branchName,
      providerName,
      providerInvoice,
      notes,
      items: movements.map((m) => ({
        id: m.id,
        productId: m.product_id,
        productName: m.products?.name || "Producto",
        sku: m.products?.sku || "",
        unit: m.products?.unit || "UND",
        qty: m.qty,
        cost: m.cost,
      })),
      org: {
        name: org.name || "Mi Empresa",
        ruc: org.ruc || "",
        address: org.address || "",
        phone: org.phone || "",
      },
    };

    return NextResponse.json({ 
      success: true, 
      movements, 
      consecutivo: nextConsecutivo,
      batchId,
      printData,
    });

  } catch (err) {
    console.error("BATCH MOVEMENT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const { searchParams } = new URL(req.url);
    const batchId = searchParams.get("batchId");
    const consecutivo = searchParams.get("consecutivo");

    if (!orgSlug)
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });

    if (!batchId && !consecutivo)
      return NextResponse.json({ error: "Missing batchId or consecutivo" }, { status: 400 });

    const { data: org } = await supabase
      .from("organizations")
      .select("id,name,ruc,address,phone")
      .eq("slug", orgSlug)
      .single();

    if (!org)
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });

    let query = supabase
      .from("inventory_movements")
      .select("*,products:product_id(id,name,sku,unit),branches:to_branch(name)")
      .eq("org_id", org.id);

    if (batchId) {
      query = query.eq("batch_id", batchId);
    } else if (consecutivo) {
      query = query.eq("consecutivo", Number(consecutivo));
    }

    const { data: movements, error } = await query.order("created_at", { ascending: true });

    if (error) throw error;
    if (!movements || movements.length === 0)
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });

    const first = movements[0];

    const printData = {
      consecutivo: first.consecutivo,
      batchId: first.batch_id,
      type: first.type,
      date: first.created_at?.substring(0, 10),
      time: new Date(first.created_at).toLocaleTimeString("es-NI"),
      userName: first.created_by || "Usuario",
      branchName: first.branches?.name || "",
      providerName: first.provider_name,
      providerInvoice: first.provider_invoice,
      notes: first.reference,
      items: movements.map((m) => ({
        id: m.id,
        productId: m.product_id,
        productName: m.products?.name || "Producto",
        sku: m.products?.sku || "",
        unit: m.products?.unit || "UND",
        qty: m.qty,
        cost: m.cost,
      })),
      org: {
        name: org.name || "Mi Empresa",
        ruc: org.ruc || "",
        address: org.address || "",
        phone: org.phone || "",
      },
    };

    return NextResponse.json({ success: true, printData });

  } catch (err) {
    console.error("GET BATCH ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
