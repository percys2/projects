import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { buildThermalTicket } from "@/src/modules/POS/utils/buildThermalTicket";

export async function POST(req) {
  try {
    const body = await req.json();
    const { saleId, orgId } = body;

    if (!saleId || !orgId)
      return NextResponse.json({ error: "Missing saleId or orgId" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Load sale
    const { data: sale, error: saleErr } = await supabase
      .from("sales")
      .select("*, clients(*), branches(*), sales_items(*, products(*))")
      .eq("id", saleId)
      .eq("org_id", orgId)
      .single();

    if (saleErr) throw saleErr;

    const ticket = buildThermalTicket(sale);

    // Send to printer-server (configurable via environment variable)
    const printerServerUrl = process.env.PRINTER_SERVER_URL || "http://localhost:8089";
    await fetch(`${printerServerUrl}/print-thermal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: ticket })
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PRINT ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
