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

    const { data: accounts, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("org_id", orgId)
      .order("code", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ accounts: accounts || [] });
  } catch (err) {
    console.error("Accounts GET error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    const accountData = {
      org_id: orgId,
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype || null,
      parent_id: body.parent_id || null,
      is_active: body.is_active !== false,
    };

    const { data: account, error } = await supabase
      .from("accounts")
      .insert(accountData)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ account }, { status: 201 });
  } catch (err) {
    console.error("Accounts POST error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    // Securely derive org context from authenticated session
    const context = await getOrgContext(req);
    
    if (!context.success) {
      return NextResponse.json({ error: context.error }, { status: context.status });
    }

    const { orgId } = context;
    const supabase = supabaseAdmin;
    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    const updateData = {
      code: body.code,
      name: body.name,
      type: body.type,
      subtype: body.subtype || null,
      parent_id: body.parent_id || null,
      is_active: body.is_active,
    };

    const { data: account, error } = await supabase
      .from("accounts")
      .update(updateData)
      .eq("id", body.id)
      .eq("org_id", orgId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ account });
  } catch (err) {
    console.error("Accounts PUT error:", err);
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

    if (!body.id) {
      return NextResponse.json({ error: "Missing account ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("accounts")
      .delete()
      .eq("id", body.id)
      .eq("org_id", orgId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Accounts DELETE error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
