module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/lib/supabase/server.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient,
    "createServerSupabaseClient",
    ()=>createServerSupabaseClient,
    "supabase",
    ()=>supabase,
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@supabase/ssr/dist/module/index.js [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/headers.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@supabase/supabase-js/dist/module/index.js [app-route] (ecmascript) <locals>");
;
;
;
async function createServerSupabaseClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://xekxaazhbebwuuxirtcv.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla3hhYXpoYmVid3V1eGlydGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODk4MTYsImV4cCI6MjA3OTI2NTgxNn0.L3cdFTv4O1T5OPFEWJEUJdCZZx1Wv3j5RnF_D2lg-FU"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {
                // Called from Server Component - can be ignored if middleware refreshes sessions
                }
            }
        }
    });
}
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://xekxaazhbebwuuxirtcv.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
const createClient = createServerSupabaseClient;
const supabase = supabaseAdmin;
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/app/api/crm/opportunities/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DELETE",
    ()=>DELETE,
    "GET",
    ()=>GET,
    "POST",
    ()=>POST,
    "PUT",
    ()=>PUT
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/lib/supabase/server.js [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        const orgSlug = req.headers.get("x-org-slug");
        if (!orgSlug) return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing org slug"
        }, {
            status: 400
        });
        const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
        const { data, error } = await supabase.from("crm_opportunities").select(`
        *,
        client:clients(id, first_name, last_name, phone),
        stage:crm_stages(id, name, code, color, probability, sort_order)
      `).eq("org_id", org.id).order("created_at", {
            ascending: false
        });
        if (error) throw error;
        const formatted = data.map((opp)=>({
                ...opp,
                client_id: opp.client?.id || null,
                client_name: `${opp.client?.first_name || ""} ${opp.client?.last_name || ""}`.trim(),
                client_phone: opp.client?.phone || null,
                stage_id: opp.stage?.id ?? opp.stage_id,
                stage_name: opp.stage?.name || null,
                stage_color: opp.stage?.color || "gray",
                stage_order: opp.stage?.sort_order || 0,
                stage_code: opp.stage?.code || null
            }));
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            opportunities: formatted
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        const orgSlug = req.headers.get("x-org-slug");
        const body = await req.json();
        if (!orgSlug) return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing org slug"
        }, {
            status: 400
        });
        const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
        // Obtener primera etapa automáticamente
        const { data: defaultStage } = await supabase.from("crm_stages").select("id").order("sort_order").limit(1).single();
        const stageToUse = body.stage_id || defaultStage.id;
        const insertData = {
            org_id: org.id,
            title: body.title,
            client_id: body.client_id || null,
            amount: body.amount || 0,
            stage_id: stageToUse,
            status: body.status || "open",
            expected_close_date: body.expected_close_date || null,
            source: body.source || null,
            notes: body.notes || null
        };
        const { data, error } = await supabase.from("crm_opportunities").insert(insertData).select(`
        *,
        client:clients(id, first_name, last_name, phone),
        stage:crm_stages(id, name, code, color, probability, sort_order)
      `).single();
        if (error) throw error;
        const formatted = {
            ...data,
            client_id: data.client?.id || null,
            client_name: `${data.client?.first_name || ""} ${data.client?.last_name || ""}`.trim(),
            stage_id: data.stage?.id,
            stage_name: data.stage?.name,
            stage_color: data.stage?.color,
            stage_order: data.stage?.sort_order,
            stage_code: data.stage?.code
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            opportunity: formatted
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
async function PUT(req) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        const body = await req.json();
        const orgSlug = req.headers.get("x-org-slug");
        if (!orgSlug || !body.id) return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing data"
        }, {
            status: 400
        });
        const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
        const updateData = {
            title: body.title,
            client_id: body.client_id || null,
            amount: body.amount,
            stage_id: body.stage_id,
            status: body.status,
            expected_close_date: body.expected_close_date,
            source: body.source,
            notes: body.notes,
            lost_reason: body.lost_reason || null,
            updated_at: new Date().toISOString()
        };
        const { data, error } = await supabase.from("crm_opportunities").update(updateData).eq("id", body.id).eq("org_id", org.id).select(`
        *,
        client:clients(id, first_name, last_name, phone),
        stage:crm_stages(id, name, code, color, probability, sort_order)
      `).single();
        if (error) throw error;
        const formatted = {
            ...data,
            client_id: data.client?.id || null,
            client_name: `${data.client?.first_name || ""} ${data.client?.last_name || ""}`.trim(),
            stage_id: data.stage?.id,
            stage_name: data.stage?.name,
            stage_color: data.stage?.color,
            stage_order: data.stage?.sort_order,
            stage_code: data.stage?.code
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            opportunity: formatted
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
async function DELETE(req) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        const orgSlug = req.headers.get("x-org-slug");
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!orgSlug || !id) return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: "Missing data"
        }, {
            status: 400
        });
        const { data: org } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
        const { error } = await supabase.from("crm_opportunities").delete().eq("id", id).eq("org_id", org.id);
        if (error) throw error;
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true
        });
    } catch (err) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: err.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__5c18e36b._.js.map