import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabase/server";
import { getOrgContext } from "@/src/lib/api/getOrgContext";

export async function GET(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;

    const { data: documents, error } = await supabase
      .from("employee_documents")
      .select(`
        *,
        employee:employees(id, name)
      `)
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ documents: documents || [] });
  } catch (err) {
    console.error("GET documents error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId, userId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    const { employeeId, type, name, fileUrl, fileName, fileSize, expiryDate, notes } = body;

    if (!employeeId || !name) {
      return NextResponse.json({ error: "Campos requeridos: empleado, nombre" }, { status: 400 });
    }

    const { data: document, error } = await supabase
      .from("employee_documents")
      .insert({
        org_id: orgId,
        employee_id: employeeId,
        type: type || "otro",
        name,
        file_url: fileUrl || null,
        file_name: fileName || null,
        file_size: fileSize || null,
        expiry_date: expiryDate || null,
        notes: notes || null,
        created_by: userId,
      })
      .select(`
        *,
        employee:employees(id, name)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({ document });
  } catch (err) {
    console.error("POST document error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const context = await getOrgContext(req);
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID del documento requerido" }, { status: 400 });
    }

    const { data: doc } = await supabase
      .from("employee_documents")
      .select("file_url")
      .eq("id", id)
      .eq("org_id", orgId)
      .single();

    if (doc?.file_url) {
      const filePath = doc.file_url.split("/").pop();
      await supabase.storage.from("employee-documents").remove([filePath]);
    }

    const { error } = await supabase
      .from("employee_documents")
      .delete()
      .eq("id", id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE document error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
