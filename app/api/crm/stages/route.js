import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";

const DEFAULT_STAGES = [
  { code: "prospeccion", name: "Prospección", sort_order: 1, probability: 0.10, color: "slate" },
  { code: "contacto", name: "Contacto", sort_order: 2, probability: 0.20, color: "blue" },
  { code: "visita", name: "Visita Finca", sort_order: 3, probability: 0.35, color: "cyan" },
  { code: "demo", name: "Demostración", sort_order: 4, probability: 0.50, color: "indigo" },
  { code: "cotizacion", name: "Cotización", sort_order: 5, probability: 0.70, color: "purple" },
  { code: "negociacion", name: "Negociación", sort_order: 6, probability: 0.85, color: "amber" },
  { code: "ganado", name: "Ganado", sort_order: 7, probability: 1.00, color: "emerald" },
  { code: "perdido", name: "Perdido", sort_order: 8, probability: 0.00, color: "red" },
];

export async function GET(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    let { data: stages, error } = await supabase
      .from("crm_stages")
      .select("*")
      .eq("org_id", org.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("CRM stages fetch error:", error);
      stages = DEFAULT_STAGES.map((s, i) => ({ ...s, id: `default-${i}` }));
    }

    if (!stages || stages.length === 0) {
      stages = DEFAULT_STAGES.map((s, i) => ({ ...s, id: `default-${i}` }));
    }

    return NextResponse.json({ stages });
  } catch (err) {
    console.error("CRM stages GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const supabase = supabaseAdmin;
    const orgSlug = req.headers.get("x-org-slug");
    const body = await req.json();

    if (!orgSlug) {
      return NextResponse.json({ error: "Missing org slug" }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("id")
      .eq("slug", orgSlug)
      .single();

    if (orgError) throw orgError;

    const stageData = {
      org_id: org.id,
      name: body.name,
      code: body.code,
      sort_order: body.sort_order,
      probability: body.probability || 0,
      color: body.color || "slate",
      is_active: true,
    };

    const { data: stage, error } = await supabase
      .from("crm_stages")
      .insert(stageData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ stage });
  } catch (err) {
    console.error("CRM stages POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}