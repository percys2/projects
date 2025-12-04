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
"[project]/Desktop/proyectos coding/agro-erp-production-2/app/api/dashboard/route.js [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/lib/supabase/server.js [app-route] (ecmascript)");
;
;
async function GET(req) {
    try {
        const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$lib$2f$supabase$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createServerSupabaseClient"])();
        const orgSlug = req.headers.get("x-org-slug");
        const range = req.nextUrl?.searchParams?.get("range") || "30";
        if (!orgSlug) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Missing org slug"
            }, {
                status: 400
            });
        }
        const { data: org, error: orgError } = await supabase.from("organizations").select("id").eq("slug", orgSlug).single();
        if (orgError || !org) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Organization not found"
            }, {
                status: 404
            });
        }
        const orgId = org.id;
        const now = new Date();
        const periodStart = new Date(now);
        periodStart.setDate(periodStart.getDate() - parseInt(range));
        const periodStartISO = periodStart.toISOString();
        // 1. SALES DATA with items
        const { data: salesData } = await supabase.from("sales").select(`
        id, total, client_id, created_at,
        sales_items (quantity, price, cost, subtotal, margin, product_id)
      `).eq("org_id", orgId).gte("created_at", periodStartISO);
        let revenue = 0, grossProfit = 0, cogs = 0;
        const clientSales = {}, productSales = {};
        (salesData || []).forEach((sale)=>{
            (sale.sales_items || []).forEach((item)=>{
                const itemRevenue = Number(item.subtotal) || Number(item.quantity) * Number(item.price);
                const itemCost = Number(item.cost || 0) * Number(item.quantity);
                const itemMargin = Number(item.margin) || itemRevenue - itemCost;
                revenue += itemRevenue;
                cogs += itemCost;
                grossProfit += itemMargin;
                if (sale.client_id) {
                    if (!clientSales[sale.client_id]) {
                        clientSales[sale.client_id] = {
                            totalSales: 0,
                            totalMargin: 0,
                            orderCount: 0
                        };
                    }
                    clientSales[sale.client_id].totalSales += itemRevenue;
                    clientSales[sale.client_id].totalMargin += itemMargin;
                }
                if (item.product_id) {
                    if (!productSales[item.product_id]) {
                        productSales[item.product_id] = {
                            quantitySold: 0,
                            revenue: 0,
                            grossProfit: 0
                        };
                    }
                    productSales[item.product_id].quantitySold += Number(item.quantity);
                    productSales[item.product_id].revenue += itemRevenue;
                    productSales[item.product_id].grossProfit += itemMargin;
                }
            });
            if (sale.client_id && clientSales[sale.client_id]) {
                clientSales[sale.client_id].orderCount += 1;
            }
        });
        const grossMarginPct = revenue > 0 ? grossProfit / revenue * 100 : 0;
        const markupPct = cogs > 0 ? (revenue - cogs) / cogs * 100 : 0;
        // 2. INVENTORY DATA
        const { data: inventory } = await supabase.from("inventory").select(`quantity, cost, price, product_id, products (id, name, category)`).eq("org_id", orgId);
        let inventoryValue = 0, potentialRevenue = 0, potentialGrossProfit = 0;
        const categoryInventory = {};
        (inventory || []).forEach((item)=>{
            const qty = Number(item.quantity) || 0;
            const cost = Number(item.cost) || 0;
            const price = Number(item.price) || 0;
            const category = item.products?.category || "Sin categoría";
            inventoryValue += qty * cost;
            potentialRevenue += qty * price;
            potentialGrossProfit += qty * (price - cost);
            if (!categoryInventory[category]) {
                categoryInventory[category] = {
                    inventoryValue: 0,
                    potentialRevenue: 0,
                    potentialGrossProfit: 0,
                    totalUnits: 0
                };
            }
            categoryInventory[category].inventoryValue += qty * cost;
            categoryInventory[category].potentialRevenue += qty * price;
            categoryInventory[category].potentialGrossProfit += qty * (price - cost);
            categoryInventory[category].totalUnits += qty;
        });
        const periodDays = parseInt(range);
        const inventoryTurnover = inventoryValue > 0 ? cogs / periodDays * 365 / inventoryValue : 0;
        const daysInventoryOnHand = cogs > 0 ? inventoryValue / cogs * periodDays : 0;
        // 3. TOP 10 CLIENTS
        const clientIds = Object.keys(clientSales);
        let topClients = [];
        if (clientIds.length > 0) {
            const { data: clients } = await supabase.from("clients").select("id, name, phone").in("id", clientIds);
            topClients = clientIds.map((id)=>{
                const client = clients?.find((c)=>c.id === id);
                return {
                    id,
                    name: client?.name || "Cliente desconocido",
                    phone: client?.phone || "",
                    ...clientSales[id],
                    marginPct: clientSales[id].totalSales > 0 ? clientSales[id].totalMargin / clientSales[id].totalSales * 100 : 0
                };
            }).sort((a, b)=>b.totalSales - a.totalSales).slice(0, 10);
        }
        // 4. TOP 10 PRODUCTS
        const productIds = Object.keys(productSales);
        let topProducts = [];
        if (productIds.length > 0) {
            const { data: products } = await supabase.from("products").select("id, name, category, sku").in("id", productIds);
            topProducts = productIds.map((id)=>{
                const product = products?.find((p)=>p.id === id);
                return {
                    id,
                    name: product?.name || "Producto desconocido",
                    category: product?.category || "",
                    sku: product?.sku || "",
                    ...productSales[id],
                    marginPct: productSales[id].revenue > 0 ? productSales[id].grossProfit / productSales[id].revenue * 100 : 0
                };
            }).sort((a, b)=>b.revenue - a.revenue).slice(0, 10);
        }
        // 5. INVENTORY BY CATEGORY
        const inventoryByCategory = Object.entries(categoryInventory).map(([category, data])=>({
                category,
                ...data,
                marginPct: data.potentialRevenue > 0 ? data.potentialGrossProfit / data.potentialRevenue * 100 : 0
            })).sort((a, b)=>b.inventoryValue - a.inventoryValue);
        // 6. LOW STOCK
        const { data: lowStock } = await supabase.from("inventory").select(`quantity, products (id, name, min_stock, category)`).eq("org_id", orgId).lt("quantity", 10);
        // 7. COUNTS
        const { count: clientsCount } = await supabase.from("clients").select("*", {
            count: "exact",
            head: true
        }).eq("org_id", orgId);
        const { count: productsCount } = await supabase.from("products").select("*", {
            count: "exact",
            head: true
        }).eq("org_id", orgId);
        const { count: employeesCount } = await supabase.from("employees").select("*", {
            count: "exact",
            head: true
        }).eq("org_id", orgId).eq("status", "activo");
        // 8. CRM PIPELINE VALUE
        let pipelineValue = 0;
        try {
            const { data: opportunities } = await supabase.from("crm_opportunities").select("amount").eq("org_id", orgId).eq("status", "open");
            pipelineValue = opportunities?.reduce((sum, o)=>sum + (Number(o.amount) || 0), 0) || 0;
        } catch (e) {}
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            period: {
                days: periodDays,
                from: periodStartISO,
                to: now.toISOString()
            },
            kpis: {
                revenue,
                grossProfit,
                cogs,
                grossMarginPct: Math.round(grossMarginPct * 100) / 100,
                markupPct: Math.round(markupPct * 100) / 100,
                inventoryValue,
                potentialRevenue,
                potentialGrossProfit,
                clientsCount: clientsCount || 0,
                productsCount: productsCount || 0,
                employeesCount: employeesCount || 0,
                salesCount: salesData?.length || 0,
                pipelineValue
            },
            profitability: {
                grossMarginPct: Math.round(grossMarginPct * 100) / 100,
                markupPct: Math.round(markupPct * 100) / 100,
                inventoryTurnover: Math.round(inventoryTurnover * 100) / 100,
                daysInventoryOnHand: Math.round(daysInventoryOnHand)
            },
            topClients,
            topProducts,
            inventoryByCategory,
            lowStock: lowStock || []
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a51bd224._.js.map