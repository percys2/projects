(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ACTIVITY_TYPES",
    ()=>ACTIVITY_TYPES,
    "DEFAULT_STAGES",
    ()=>DEFAULT_STAGES,
    "OPPORTUNITY_SOURCES",
    ()=>OPPORTUNITY_SOURCES,
    "STAGE_COLORS",
    ()=>STAGE_COLORS,
    "calculatePipelineValue",
    ()=>calculatePipelineValue,
    "getStageColor",
    ()=>getStageColor,
    "groupOpportunitiesByStage",
    ()=>groupOpportunitiesByStage
]);
const DEFAULT_STAGES = [
    {
        code: "prospeccion",
        name: "Prospección",
        order: 1,
        probability: 0.10,
        color: "slate"
    },
    {
        code: "contacto",
        name: "Contacto",
        order: 2,
        probability: 0.20,
        color: "blue"
    },
    {
        code: "visita",
        name: "Visita Finca",
        order: 3,
        probability: 0.35,
        color: "cyan"
    },
    {
        code: "demo",
        name: "Demostración",
        order: 4,
        probability: 0.50,
        color: "indigo"
    },
    {
        code: "cotizacion",
        name: "Cotización",
        order: 5,
        probability: 0.70,
        color: "purple"
    },
    {
        code: "negociacion",
        name: "Negociación",
        order: 6,
        probability: 0.85,
        color: "amber"
    },
    {
        code: "ganado",
        name: "Ganado",
        order: 7,
        probability: 1.00,
        color: "emerald"
    },
    {
        code: "perdido",
        name: "Perdido",
        order: 8,
        probability: 0.00,
        color: "red"
    }
];
const STAGE_COLORS = {
    slate: {
        bg: "bg-slate-100",
        border: "border-slate-300",
        text: "text-slate-700",
        header: "bg-slate-200"
    },
    blue: {
        bg: "bg-blue-50",
        border: "border-blue-300",
        text: "text-blue-700",
        header: "bg-blue-200"
    },
    cyan: {
        bg: "bg-cyan-50",
        border: "border-cyan-300",
        text: "text-cyan-700",
        header: "bg-cyan-200"
    },
    indigo: {
        bg: "bg-indigo-50",
        border: "border-indigo-300",
        text: "text-indigo-700",
        header: "bg-indigo-200"
    },
    purple: {
        bg: "bg-purple-50",
        border: "border-purple-300",
        text: "text-purple-700",
        header: "bg-purple-200"
    },
    amber: {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-700",
        header: "bg-amber-200"
    },
    emerald: {
        bg: "bg-emerald-50",
        border: "border-emerald-300",
        text: "text-emerald-700",
        header: "bg-emerald-200"
    },
    red: {
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-700",
        header: "bg-red-200"
    }
};
const ACTIVITY_TYPES = [
    {
        code: "llamada",
        name: "Llamada",
        icon: "phone"
    },
    {
        code: "visita",
        name: "Visita",
        icon: "car"
    },
    {
        code: "whatsapp",
        name: "WhatsApp",
        icon: "message"
    },
    {
        code: "email",
        name: "Email",
        icon: "mail"
    },
    {
        code: "demo",
        name: "Demo Campo",
        icon: "leaf"
    }
];
const OPPORTUNITY_SOURCES = [
    "Referido",
    "Visita finca",
    "WhatsApp",
    "Llamada entrante",
    "Feria agrícola",
    "Web",
    "Otro"
];
function getStageColor(colorName) {
    return STAGE_COLORS[colorName] || STAGE_COLORS.slate;
}
function calculatePipelineValue(opportunities, stages) {
    return opportunities.reduce((total, opp)=>{
        const stage = stages.find((s)=>s.id === opp.stage_id);
        const probability = stage?.probability || 0;
        return total + (opp.amount || 0) * probability;
    }, 0);
}
function groupOpportunitiesByStage(opportunities, stages) {
    const grouped = {};
    stages.forEach((stage)=>{
        grouped[stage.id] = {
            stage,
            opportunities: [],
            totalAmount: 0,
            count: 0
        };
    });
    opportunities.forEach((opp)=>{
        if (grouped[opp.stage_id]) {
            grouped[opp.stage_id].opportunities.push(opp);
            grouped[opp.stage_id].totalAmount += opp.amount || 0;
            grouped[opp.stage_id].count += 1;
        }
    });
    return Object.values(grouped).sort((a, b)=>a.stage.sort_order - b.stage.sort_order);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/hooks/useCrm.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCrm",
    ()=>useCrm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function useCrm(orgSlug) {
    _s();
    /* ===========================================================
     ESTADOS PRINCIPALES
  =========================================================== */ const [stages, setStages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [opportunities, setOpportunities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [activities, setActivities] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [clients, setClients] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ===========================================================
     FILTROS
  =========================================================== */ const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [stageFilter, setStageFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("TODOS");
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("open");
    /* ===========================================================
     MODALES
  =========================================================== */ const [isOpportunityModalOpen, setIsOpportunityModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingOpportunity, setEditingOpportunity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isActivityModalOpen, setIsActivityModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedOpportunityForActivity, setSelectedOpportunityForActivity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isClientModalOpen, setIsClientModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingClient, setEditingClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ===========================================================
     RECARGA PRINCIPAL DEL CRM
  =========================================================== */ const loadCrm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useCrm.useCallback[loadCrm]": async ()=>{
            try {
                setLoading(true);
                setError(null);
                const res = await fetch(`/api/crm?orgSlug=${orgSlug}`, {
                    method: "GET"
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.error || "Error al cargar CRM");
                setStages(json.data.stages || []);
                setOpportunities(json.data.opportunities || []);
                setActivities(json.data.activities || []);
                setClients(json.data.clients || []);
            } catch (err) {
                console.error("CRM Load Error:", err);
                setError(err.message);
            } finally{
                setLoading(false);
            }
        }
    }["useCrm.useCallback[loadCrm]"], [
        orgSlug
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useCrm.useEffect": ()=>{
            loadCrm();
        }
    }["useCrm.useEffect"], [
        loadCrm
    ]);
    /* ===========================================================
     COMPUTADOS (PIPELINE + AGRUPACIÓN)
  =========================================================== */ // Agrupar oportunidades por etapa
    const groupedOpportunities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCrm.useMemo[groupedOpportunities]": ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["groupOpportunitiesByStage"])(opportunities, stages);
        }
    }["useCrm.useMemo[groupedOpportunities]"], [
        opportunities,
        stages
    ]);
    // Valor total del pipeline
    const pipelineValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCrm.useMemo[pipelineValue]": ()=>{
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["calculatePipelineValue"])(opportunities);
        }
    }["useCrm.useMemo[pipelineValue]"], [
        opportunities
    ]);
    /* ===========================================================
     FILTRO INTELIGENTE DE OPORTUNIDADES
  =========================================================== */ const filteredOpportunities = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useCrm.useMemo[filteredOpportunities]": ()=>{
            let list = [
                ...opportunities
            ];
            // filtro por texto (cliente, nombre, teléfono)
            if (search.trim() !== "") {
                const q = search.toLowerCase();
                list = list.filter({
                    "useCrm.useMemo[filteredOpportunities]": (op)=>{
                        const clientName = `${op.client?.first_name || ""} ${op.client?.last_name || ""}`.toLowerCase();
                        return op.title?.toLowerCase().includes(q) || clientName.includes(q) || op.client?.phone?.includes(q);
                    }
                }["useCrm.useMemo[filteredOpportunities]"]);
            }
            // filtrar por etapa
            if (stageFilter !== "TODOS") {
                list = list.filter({
                    "useCrm.useMemo[filteredOpportunities]": (op)=>op.stage_id === stageFilter
                }["useCrm.useMemo[filteredOpportunities]"]);
            }
            // filtrar por estado
            if (statusFilter === "open") {
                list = list.filter({
                    "useCrm.useMemo[filteredOpportunities]": (op)=>!op.is_won && !op.is_lost
                }["useCrm.useMemo[filteredOpportunities]"]);
            } else if (statusFilter === "won") {
                list = list.filter({
                    "useCrm.useMemo[filteredOpportunities]": (op)=>op.is_won
                }["useCrm.useMemo[filteredOpportunities]"]);
            } else if (statusFilter === "lost") {
                list = list.filter({
                    "useCrm.useMemo[filteredOpportunities]": (op)=>op.is_lost
                }["useCrm.useMemo[filteredOpportunities]"]);
            }
            return list;
        }
    }["useCrm.useMemo[filteredOpportunities]"], [
        opportunities,
        search,
        stageFilter,
        statusFilter
    ]);
    /* ===========================================================
     FUNCIONES PARA MODALES
  =========================================================== */ const openNewOpportunityModal = ()=>{
        setEditingOpportunity(null);
        setIsOpportunityModalOpen(true);
    };
    const openEditOpportunityModal = (op)=>{
        setEditingOpportunity(op);
        setIsOpportunityModalOpen(true);
    };
    const openNewActivityModal = (opportunity)=>{
        setSelectedOpportunityForActivity(opportunity);
        setIsActivityModalOpen(true);
    };
    const openEditClientModal = (client)=>{
        setEditingClient(client);
        setIsClientModalOpen(true);
    };
    const closeAllModals = ()=>{
        setIsOpportunityModalOpen(false);
        setIsActivityModalOpen(false);
        setIsClientModalOpen(false);
        setEditingOpportunity(null);
        setSelectedOpportunityForActivity(null);
        setEditingClient(null);
    };
    /* ===========================================================
     RETORNO COMPLETO
  =========================================================== */ return {
        // estados
        loading,
        error,
        stages,
        opportunities,
        activities,
        clients,
        // computados
        groupedOpportunities,
        pipelineValue,
        filteredOpportunities,
        // filtros
        search,
        setSearch,
        stageFilter,
        setStageFilter,
        statusFilter,
        setStatusFilter,
        // modales
        isOpportunityModalOpen,
        setIsOpportunityModalOpen,
        editingOpportunity,
        setEditingOpportunity,
        isActivityModalOpen,
        setIsActivityModalOpen,
        selectedOpportunityForActivity,
        setSelectedOpportunityForActivity,
        isClientModalOpen,
        setIsClientModalOpen,
        editingClient,
        setEditingClient,
        // funciones
        openNewOpportunityModal,
        openEditOpportunityModal,
        openNewActivityModal,
        openEditClientModal,
        closeAllModals,
        reload: loadCrm
    };
}
_s(useCrm, "sAJQQQ4R9hW2R9qhGfHNjwSLeAg=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CrmStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
"use client";
;
;
function CrmStats({ stats }) {
    const { totalOpportunities = 0, totalPipelineValue = 0, conversionRate = 0, closingThisWeek = 0 } = stats || {};
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-1 md:grid-cols-4 gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500 uppercase tracking-wide",
                        children: "Oportunidades Abiertas"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 16,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-bold text-slate-800 mt-1",
                        children: totalOpportunities
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 19,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mt-1",
                        children: "en pipeline"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500 uppercase tracking-wide",
                        children: "Valor Total Pipeline"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-bold text-emerald-600 mt-1",
                        children: [
                            "C$ ",
                            totalPipelineValue.toLocaleString("es-NI")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 29,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mt-1",
                        children: "potencial de ventas"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 32,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                lineNumber: 25,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500 uppercase tracking-wide",
                        children: "Tasa de Cierre"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-bold text-indigo-600 mt-1",
                        children: [
                            conversionRate,
                            "%"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 39,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mt-1",
                        children: "últimos 30 días"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 42,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl p-4 shadow-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-500 uppercase tracking-wide",
                        children: "Próximos Cierres"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-bold text-amber-600 mt-1",
                        children: closingThisWeek
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 49,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-slate-400 mt-1",
                        children: "esta semana"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
                lineNumber: 45,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = CrmStats;
var _c;
__turbopack_context__.k.register(_c, "CrmStats");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CrmFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
"use client";
;
;
function CrmFilters({ search, setSearch, stageFilter, setStageFilter, stages }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap gap-3 items-center",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                placeholder: "Buscar por nombre o cliente...",
                value: search,
                onChange: (e)=>setSearch(e.target.value),
                className: "px-3 py-2 border rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-slate-200"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx",
                lineNumber: 14,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: stageFilter,
                onChange: (e)=>setStageFilter(e.target.value),
                className: "px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "TODOS",
                        children: "Todas las etapas"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx",
                        lineNumber: 27,
                        columnNumber: 9
                    }, this),
                    stages.map((stage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: stage.id,
                            children: stage.name
                        }, stage.id, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx",
                lineNumber: 22,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = CrmFilters;
var _c;
__turbopack_context__.k.register(_c, "CrmFilters");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OpportunityCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PencilIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PencilIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@heroicons/react/24/outline/esm/PencilIcon.js [app-client] (ecmascript) <export default as PencilIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$TrashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrashIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@heroicons/react/24/outline/esm/TrashIcon.js [app-client] (ecmascript) <export default as TrashIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleOvalLeftIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChatBubbleOvalLeftIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@heroicons/react/24/outline/esm/ChatBubbleOvalLeftIcon.js [app-client] (ecmascript) <export default as ChatBubbleOvalLeftIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@heroicons/react/24/outline/esm/CheckCircleIcon.js [app-client] (ecmascript) <export default as CheckCircleIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircleIcon$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/@heroicons/react/24/outline/esm/XCircleIcon.js [app-client] (ecmascript) <export default as XCircleIcon>");
"use client";
;
;
;
function OpportunityCard({ opportunity, stageColor, onEdit, onDelete, onAddActivity, onMarkWon, onMarkLost, onDragStart, onDragEnd, isDragging }) {
    const probability = opportunity.stage_probability || 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        draggable: true,
        onDragStart: onDragStart,
        onDragEnd: onDragEnd,
        className: `
        bg-white rounded-xl border shadow-[0_2px_6px_rgba(0,0,0,0.06)]
        p-3 cursor-grab transition-all select-none
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]
        active:cursor-grabbing
        ${isDragging ? "opacity-40 scale-[0.98]" : "opacity-100"}
      `,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-1 h-full absolute left-0 top-0 rounded-l-xl",
                style: {
                    backgroundColor: stageColor
                }
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-start mb-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-semibold text-sm text-slate-800 leading-tight",
                        children: opportunity.title
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 47,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-full",
                        children: [
                            "C$",
                            Number(opportunity.amount).toLocaleString("es-NI")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500 mb-2",
                children: opportunity.client_name || "— Sin cliente —"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between text-[11px] text-slate-500 font-medium mb-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Probabilidad"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: [
                                    probability,
                                    "%"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full h-2 bg-slate-200 rounded-full overflow-hidden",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "h-full rounded-full transition-all",
                            style: {
                                width: `${probability}%`,
                                backgroundColor: stageColor
                            }
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                            lineNumber: 69,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onAddActivity,
                        className: "text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleOvalLeftIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChatBubbleOvalLeftIcon$3e$__["ChatBubbleOvalLeftIcon"], {
                                className: "h-4 w-4"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 87,
                                columnNumber: 11
                            }, this),
                            "Actividad"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "p-1 hover:bg-slate-100 rounded",
                                onClick: onEdit,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PencilIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__PencilIcon$3e$__["PencilIcon"], {
                                    className: "h-4 w-4 text-slate-600"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "p-1 hover:bg-slate-100 rounded",
                                onClick: onDelete,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$TrashIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__TrashIcon$3e$__["TrashIcon"], {
                                    className: "h-4 w-4 text-red-500"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            onMarkWon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "p-1 hover:bg-green-50 rounded",
                                onClick: onMarkWon,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$CheckCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircleIcon$3e$__["CheckCircleIcon"], {
                                    className: "h-5 w-5 text-green-600"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                    lineNumber: 114,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            onMarkLost && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "p-1 hover:bg-red-50 rounded",
                                onClick: onMarkLost,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XCircleIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircleIcon$3e$__["XCircleIcon"], {
                                    className: "h-5 w-5 text-red-600"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                    lineNumber: 124,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                                lineNumber: 120,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                        lineNumber: 92,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c = OpportunityCard;
var _c;
__turbopack_context__.k.register(_c, "OpportunityCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PipelineBoard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$OpportunityCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityCard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function PipelineBoard({ pipelineData, onMoveOpportunity, onEditOpportunity, onDeleteOpportunity, onAddActivity, onMarkWon, onMarkLost }) {
    _s();
    const [draggedOpportunity, setDraggedOpportunity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [dragOverStage, setDragOverStage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ============================================================
     DRAG & DROP HANDLERS
  ============================================================ */ const handleDragStart = (e, opportunity)=>{
        setDraggedOpportunity(opportunity);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", opportunity.id);
    };
    const handleDragEnd = ()=>{
        setDraggedOpportunity(null);
        setDragOverStage(null);
    };
    const handleDragOver = (e, stageId)=>{
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverStage(stageId);
    };
    const handleDrop = async (e, targetStageId)=>{
        e.preventDefault();
        setDragOverStage(null);
        if (draggedOpportunity && draggedOpportunity.stage_id !== targetStageId) {
            await onMoveOpportunity(draggedOpportunity.id, targetStageId);
        }
        setDraggedOpportunity(null);
    };
    /* ============================================================
     UI
  ============================================================ */ if (!pipelineData || pipelineData.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8 text-slate-400",
            children: "No hay etapas configuradas. Crea las etapas en Supabase primero."
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
            lineNumber: 55,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto pb-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-6 min-w-max px-2",
            children: pipelineData.map(({ stage, opportunities, totalAmount, count })=>{
                const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStageColor"])(stage.color);
                const isDropTarget = dragOverStage === stage.id;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    /* CARD DE COLUMNA — ESTILO MONDAY */ className: `
                w-80 flex-shrink-0 rounded-2xl
                bg-white shadow-[0_3px_8px_rgba(0,0,0,0.07)]
                border border-slate-100
                flex flex-col transition-all
                ${isDropTarget ? "ring-2 ring-blue-400 ring-offset-2 scale-[1.01]" : ""}
              `,
                    onDragOver: (e)=>handleDragOver(e, stage.id),
                    onDrop: (e)=>handleDrop(e, stage.id),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-4 py-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "font-semibold text-slate-700 text-sm",
                                            children: stage.name
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                            lineNumber: 88,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold px-2 py-1 rounded-full bg-slate-200 text-slate-700",
                                            children: count
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                            lineNumber: 92,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                    lineNumber: 87,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-slate-500 mt-1 font-medium",
                                    children: [
                                        "Total: C$",
                                        totalAmount.toLocaleString("es-NI")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                    lineNumber: 99,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                            lineNumber: 86,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-3 space-y-3 min-h-[260px] max-h-[600px] overflow-y-auto",
                            children: [
                                opportunities.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-center py-10 text-xs text-slate-400 italic",
                                    children: isDropTarget ? "Soltar aquí…" : "Sin oportunidades"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                    lineNumber: 108,
                                    columnNumber: 19
                                }, this),
                                opportunities.map((opp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        draggable: true,
                                        onDragStart: (e)=>handleDragStart(e, opp),
                                        onDragEnd: handleDragEnd,
                                        className: `transition-all duration-200 ${draggedOpportunity?.id === opp.id ? "opacity-40" : "opacity-100"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$OpportunityCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            opportunity: opp,
                                            stageColor: stage.color,
                                            onEdit: ()=>onEditOpportunity(opp),
                                            onDelete: ()=>{
                                                if (confirm("¿Eliminar esta oportunidad?")) onDeleteOpportunity(opp.id);
                                            },
                                            onAddActivity: ()=>onAddActivity(opp),
                                            onMarkWon: ()=>onMarkWon(opp.id),
                                            onMarkLost: ()=>{
                                                const reason = prompt("Razón de pérdida:");
                                                if (reason) onMarkLost(opp.id, reason);
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                            lineNumber: 124,
                                            columnNumber: 21
                                        }, this)
                                    }, opp.id, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                        lineNumber: 115,
                                        columnNumber: 19
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                            lineNumber: 105,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-slate-50 p-3 border-t border-slate-200 rounded-b-2xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-full py-2 text-xs font-medium rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 transition",
                                onClick: ()=>onEditOpportunity(null, stage.id),
                                children: "+ Añadir oportunidad"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                                lineNumber: 144,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                            lineNumber: 143,
                            columnNumber: 15
                        }, this)
                    ]
                }, stage.id, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
                    lineNumber: 71,
                    columnNumber: 13
                }, this);
            })
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
            lineNumber: 64,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx",
        lineNumber: 62,
        columnNumber: 5
    }, this);
}
_s(PipelineBoard, "3C/jdW2fBVK3kp5IldmsZgf2shI=");
_c = PipelineBoard;
var _c;
__turbopack_context__.k.register(_c, "PipelineBoard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientStagesTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
"use client";
;
;
;
function ClientStagesTable({ clientsByStage, stages }) {
    if (!clientsByStage || clientsByStage.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8 text-slate-400",
            children: "No hay clientes con oportunidades activas"
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
            lineNumber: 9,
            columnNumber: 7
        }, this);
    }
    const formatDate = (dateStr)=>{
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return "Hoy";
        if (diffDays === 1) return "Ayer";
        if (diffDays < 7) return `Hace ${diffDays} días`;
        return date.toLocaleDateString("es-NI", {
            day: "2-digit",
            month: "short"
        });
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            className: "min-w-full text-sm",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        className: "bg-slate-50 border-b text-xs uppercase tracking-wide text-slate-500",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-left",
                                children: "Cliente"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 32,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-left",
                                children: "Teléfono"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 33,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-center",
                                children: "Etapa Actual"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 34,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-center",
                                children: "Oportunidades"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 35,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-right",
                                children: "Valor Total"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 36,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                className: "px-3 py-2 text-center",
                                children: "Último Contacto"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                lineNumber: 37,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                        lineNumber: 31,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                    lineNumber: 30,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: clientsByStage.map((client)=>{
                        const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStageColor"])(client.stage_color);
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            className: "border-b hover:bg-slate-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-medium text-slate-800",
                                        children: client.client_name
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                        lineNumber: 47,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 46,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-slate-600",
                                    children: client.client_phone || "—"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 49,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: `px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`,
                                        children: client.stage_name
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                        lineNumber: 53,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 52,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "px-2 py-1 bg-slate-100 rounded-full text-xs",
                                        children: client.opportunityCount
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                        lineNumber: 60,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 59,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-right font-medium text-emerald-600",
                                    children: [
                                        "C$ ",
                                        (client.totalAmount || 0).toLocaleString("es-NI")
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 64,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-2 text-center text-slate-500",
                                    children: formatDate(client.lastContact)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                                    lineNumber: 67,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, client.client_id, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                            lineNumber: 45,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
                    lineNumber: 40,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
            lineNumber: 29,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c = ClientStagesTable;
var _c;
__turbopack_context__.k.register(_c, "ClientStagesTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>OpportunityModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function OpportunityModal({ isOpen, onClose, onSave, opportunity, stages, clients }) {
    _s();
    const firstStage = stages?.find((s)=>s.sort_order === 1) || stages?.[0];
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        title: "",
        client_id: "",
        amount: "",
        stage_id: firstStage?.id || "",
        expected_close_date: "",
        source: "",
        notes: ""
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    /* ===========================================
     LOAD FORM DATA
  ============================================ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OpportunityModal.useEffect": ()=>{
            if (!isOpen) return;
            if (opportunity) {
                setForm({
                    title: opportunity.title || "",
                    client_id: opportunity.client_id || "",
                    amount: opportunity.amount?.toString() || "",
                    stage_id: opportunity.stage_id || firstStage?.id || "",
                    expected_close_date: opportunity.expected_close_date?.split("T")[0] || "",
                    source: opportunity.source || "",
                    notes: opportunity.notes || ""
                });
            } else {
                setForm({
                    title: "",
                    client_id: "",
                    amount: "",
                    stage_id: firstStage?.id || "",
                    expected_close_date: "",
                    source: "",
                    notes: ""
                });
            }
        }
    }["OpportunityModal.useEffect"], [
        opportunity,
        isOpen,
        stages
    ]);
    if (!isOpen) return null;
    /* ===========================================
     HANDLE INPUT CHANGE
  ============================================ */ const handleChange = (e)=>{
        const { name, value } = e.target;
        setForm((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    /* ===========================================
     SUBMIT FORM
  ============================================ */ const handleSubmit = async ()=>{
        setSaving(true);
        const safeStage = form.stage_id && form.stage_id !== "" ? form.stage_id : firstStage?.id || null;
        const data = {
            title: form.title.trim(),
            client_id: form.client_id || null,
            stage_id: safeStage,
            amount: Number(form.amount) || 0,
            expected_close_date: form.expected_close_date || null,
            source: form.source || null,
            notes: form.notes || null
        };
        if (opportunity?.id) data.id = opportunity.id;
        const result = await onSave(data);
        setSaving(false);
        if (!result.success) {
            alert(result.error || "Error al guardar");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 py-4 border-b flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold",
                            children: opportunity ? "Editar Oportunidad" : "Nueva Oportunidad"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-slate-400 hover:text-slate-600 text-2xl",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 109,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-6 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium mb-1",
                                    children: "Título *"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    name: "title",
                                    value: form.title,
                                    onChange: handleChange,
                                    required: true,
                                    placeholder: "Ej: Venta alimento - Finca La Esperanza",
                                    className: "w-full px-3 py-2 border rounded-lg text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 123,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium mb-1",
                                    children: "Cliente"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    name: "client_id",
                                    value: form.client_id,
                                    onChange: handleChange,
                                    className: "w-full px-3 py-2 border rounded-lg text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "",
                                            children: "Seleccionar cliente..."
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                            lineNumber: 143,
                                            columnNumber: 15
                                        }, this),
                                        clients.map((client)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: client.id,
                                                children: [
                                                    client.first_name,
                                                    " ",
                                                    client.last_name
                                                ]
                                            }, client.id, true, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                                lineNumber: 145,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 137,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 135,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-medium mb-1",
                                            children: "Monto *"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                            lineNumber: 155,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "number",
                                            name: "amount",
                                            value: form.amount,
                                            onChange: handleChange,
                                            required: true,
                                            className: "w-full px-3 py-2 border rounded-lg text-sm"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                            lineNumber: 156,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 154,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "block text-xs font-medium mb-1",
                                            children: "Etapa *"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                            lineNumber: 167,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            name: "stage_id",
                                            value: form.stage_id,
                                            onChange: handleChange,
                                            required: true,
                                            className: "w-full px-3 py-2 border rounded-lg text-sm",
                                            children: stages.filter((s)=>s.code !== "ganado" && s.code !== "perdido").map((stage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: stage.id,
                                                    children: stage.name
                                                }, stage.id, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                                    lineNumber: 178,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                            lineNumber: 168,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 166,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 153,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium mb-1",
                                    children: "Notas"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 188,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "notes",
                                    value: form.notes,
                                    onChange: handleChange,
                                    rows: 3,
                                    className: "w-full px-3 py-2 border rounded-lg text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 189,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 pt-4 border-t",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-sm text-slate-600",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 200,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: handleSubmit,
                                    disabled: saving,
                                    className: "px-4 py-2 text-sm bg-slate-900 text-white rounded-lg disabled:opacity-50",
                                    children: saving ? "Guardando..." : "Guardar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                                    lineNumber: 208,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                            lineNumber: 199,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
                    lineNumber: 118,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
            lineNumber: 102,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx",
        lineNumber: 101,
        columnNumber: 5
    }, this);
}
_s(OpportunityModal, "oAaFtrWQfl1JV/8HFPC6+I9mNl4=");
_c = OpportunityModal;
var _c;
__turbopack_context__.k.register(_c, "OpportunityModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ActivityModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ActivityModal({ isOpen, onClose, onSave, opportunity }) {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        type: "llamada",
        subject: "",
        description: "",
        outcome: "",
        next_step: ""
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    if (!isOpen || !opportunity) return null;
    const handleChange = (e)=>{
        const { name, value } = e.target;
        setForm((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        const data = {
            ...form,
            opportunity_id: opportunity.id,
            client_id: opportunity.client_id,
            completed_at: new Date().toISOString()
        };
        const result = await onSave(data);
        setSaving(false);
        if (result.success) {
            setForm({
                type: "llamada",
                subject: "",
                description: "",
                outcome: "",
                next_step: ""
            });
        } else {
            alert(result.error || "Error al guardar");
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl shadow-xl w-full max-w-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "px-6 py-4 border-b flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-lg font-semibold",
                                    children: "Registrar Actividad"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 46,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm text-slate-500",
                                    children: opportunity.name
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 47,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 45,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-slate-400 hover:text-slate-600 text-2xl",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 49,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                    lineNumber: 44,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "p-6 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-600 mb-2",
                                    children: "Tipo de Actividad *"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 54,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2",
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ACTIVITY_TYPES"].map((actType)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setForm((prev)=>({
                                                        ...prev,
                                                        type: actType.code
                                                    })),
                                            className: `px-3 py-2 rounded-lg text-sm border transition-all ${form.type === actType.code ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"}`,
                                            children: actType.name
                                        }, actType.code, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                            lineNumber: 57,
                                            columnNumber: 17
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 55,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 53,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-600 mb-1",
                                    children: "Asunto *"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 71,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    name: "subject",
                                    value: form.subject,
                                    onChange: handleChange,
                                    required: true,
                                    placeholder: "Ej: Llamada de seguimiento",
                                    className: "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 72,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-600 mb-1",
                                    children: "Descripción"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 78,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    name: "description",
                                    value: form.description,
                                    onChange: handleChange,
                                    rows: 2,
                                    placeholder: "Detalles de la actividad...",
                                    className: "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-600 mb-1",
                                    children: "Resultado"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    name: "outcome",
                                    value: form.outcome,
                                    onChange: handleChange,
                                    placeholder: "Ej: Cliente interesado, solicitó cotización",
                                    className: "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 86,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-xs font-medium text-slate-600 mb-1",
                                    children: "Próximo Paso"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 92,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    name: "next_step",
                                    value: form.next_step,
                                    onChange: handleChange,
                                    placeholder: "Ej: Enviar cotización el lunes",
                                    className: "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 pt-4 border-t",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-sm text-slate-600 hover:text-slate-800",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: saving,
                                    className: "px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50",
                                    children: saving ? "Guardando..." : "Guardar Actividad"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                                    lineNumber: 100,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(ActivityModal, "soruU4V149PcArPBE7U5A6r2kn8=");
_c = ActivityModal;
var _c;
__turbopack_context__.k.register(_c, "ActivityModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SalesFunnel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/services/crmConfig.js [app-client] (ecmascript)");
"use client";
;
;
;
function SalesFunnel({ pipelineData }) {
    if (!pipelineData || pipelineData.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-8 text-slate-400",
            children: "No hay datos para mostrar el embudo"
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
            lineNumber: 9,
            columnNumber: 7
        }, this);
    }
    const maxCount = Math.max(...pipelineData.map((d)=>d.count), 1);
    const totalValue = pipelineData.reduce((sum, d)=>sum + d.totalAmount, 0);
    const totalCount = pipelineData.reduce((sum, d)=>sum + d.count, 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-4 mb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 rounded-lg p-4 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-bold text-slate-800",
                                children: totalCount
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                lineNumber: 23,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "Oportunidades totales"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                lineNumber: 24,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 22,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-emerald-50 rounded-lg p-4 text-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-3xl font-bold text-emerald-600",
                                children: [
                                    "C$ ",
                                    totalValue.toLocaleString("es-NI")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-emerald-600",
                                children: "Valor total pipeline"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                lineNumber: 30,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3",
                children: pipelineData.map(({ stage, count, totalAmount })=>{
                    const colors = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$services$2f$crmConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStageColor"])(stage.color);
                    const widthPercent = Math.max(count / maxCount * 100, 5);
                    const conversionRate = totalCount > 0 ? Math.round(count / totalCount * 100) : 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-32 text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: `text-sm font-medium ${colors.text}`,
                                            children: stage.name
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 44,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400",
                                            children: [
                                                Math.round(stage.probability * 100),
                                                "% prob."
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 47,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                    lineNumber: 43,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex-1 relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-10 bg-slate-100 rounded-lg overflow-hidden",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-full ${colors.header} transition-all duration-500 flex items-center justify-end pr-3`,
                                                style: {
                                                    width: `${widthPercent}%`
                                                },
                                                children: widthPercent > 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `text-xs font-medium ${colors.text}`,
                                                    children: [
                                                        count,
                                                        " (",
                                                        conversionRate,
                                                        "%)"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                                    lineNumber: 59,
                                                    columnNumber: 25
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                                lineNumber: 54,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 53,
                                            columnNumber: 19
                                        }, this),
                                        widthPercent <= 20 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-500",
                                            children: [
                                                count,
                                                " (",
                                                conversionRate,
                                                "%)"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 66,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                    lineNumber: 52,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-32 text-right",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-semibold text-emerald-600",
                                            children: [
                                                "C$ ",
                                                totalAmount.toLocaleString("es-NI")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 73,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-slate-400",
                                            children: [
                                                "Ponderado: C$ ",
                                                Math.round(totalAmount * stage.probability).toLocaleString("es-NI")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                            lineNumber: 76,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                                    lineNumber: 72,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                            lineNumber: 42,
                            columnNumber: 15
                        }, this)
                    }, stage.id, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 41,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-6 p-4 bg-indigo-50 rounded-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                        className: "text-sm font-semibold text-indigo-700 mb-2",
                        children: "Valor Ponderado del Pipeline"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 87,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-2xl font-bold text-indigo-600",
                        children: [
                            "C$ ",
                            pipelineData.reduce((sum, d)=>sum + d.totalAmount * d.stage.probability, 0).toLocaleString("es-NI")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-indigo-500 mt-1",
                        children: "Basado en la probabilidad de cierre de cada etapa"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
                lineNumber: 86,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx",
        lineNumber: 20,
        columnNumber: 5
    }, this);
}
_c = SalesFunnel;
var _c;
__turbopack_context__.k.register(_c, "SalesFunnel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function ClientModal({ isOpen, onClose, onSave, client }) {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        first_name: "",
        last_name: "",
        phone: "",
        address: "",
        city: "",
        municipio: "",
        animal_type: "",
        sales_stage: "prospecto"
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClientModal.useEffect": ()=>{
            if (client) {
                setForm({
                    first_name: client.first_name || "",
                    last_name: client.last_name || "",
                    phone: client.phone || "",
                    address: client.address || "",
                    city: client.city || "",
                    municipio: client.municipio || "",
                    animal_type: client.animal_type || "",
                    sales_stage: client.sales_stage || "prospecto"
                });
            } else {
                setForm({
                    first_name: "",
                    last_name: "",
                    phone: "",
                    address: "",
                    city: "",
                    municipio: "",
                    animal_type: "",
                    sales_stage: "prospecto"
                });
            }
        }
    }["ClientModal.useEffect"], [
        client,
        isOpen
    ]);
    if (!isOpen) return null;
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if (!form.first_name.trim()) {
            alert("El nombre es requerido");
            return;
        }
        setSaving(true);
        try {
            await onSave(client ? {
                ...form,
                id: client.id
            } : form);
            onClose();
        } catch (err) {
            alert("Error: " + err.message);
        } finally{
            setSaving(false);
        }
    };
    const animalTypes = [
        "Bovino",
        "Porcino",
        "Avícola",
        "Equino",
        "Caprino",
        "Ovino",
        "Otro"
    ];
    const salesStages = [
        {
            value: "prospecto",
            label: "Prospecto"
        },
        {
            value: "contacto",
            label: "Contacto Inicial"
        },
        {
            value: "visita",
            label: "Visita Programada"
        },
        {
            value: "cotizacion",
            label: "Cotización Enviada"
        },
        {
            value: "negociacion",
            label: "En Negociación"
        },
        {
            value: "cliente",
            label: "Cliente Activo"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl w-full max-w-lg m-4",
            onClick: (e)=>e.stopPropagation(),
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4 border-b flex justify-between items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-bold text-lg",
                            children: client ? "Editar Cliente" : "Nuevo Cliente"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-slate-400 hover:text-slate-600 text-2xl",
                            children: "×"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                    lineNumber: 76,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "p-4 space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Nombre *"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 84,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: form.first_name,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    first_name: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            placeholder: "Nombre",
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 83,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Apellido"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 95,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: form.last_name,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    last_name: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            placeholder: "Apellido"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 96,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 82,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs font-medium text-slate-600",
                                    children: "Teléfono"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "tel",
                                    value: form.phone,
                                    onChange: (e)=>setForm({
                                            ...form,
                                            phone: e.target.value
                                        }),
                                    className: "w-full p-2 text-sm border rounded-lg",
                                    placeholder: "8888-8888"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 108,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 106,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "text-xs font-medium text-slate-600",
                                    children: "Dirección"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: form.address,
                                    onChange: (e)=>setForm({
                                            ...form,
                                            address: e.target.value
                                        }),
                                    className: "w-full p-2 text-sm border rounded-lg",
                                    placeholder: "Dirección completa"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 119,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Ciudad"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 130,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: form.city,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    city: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            placeholder: "Ciudad"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 129,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Municipio"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: form.municipio,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    municipio: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            placeholder: "Municipio"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 141,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 139,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Tipo de Animal"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: form.animal_type,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    animal_type: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "",
                                                    children: "Seleccionar..."
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                                    lineNumber: 159,
                                                    columnNumber: 17
                                                }, this),
                                                animalTypes.map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: type,
                                                        children: type
                                                    }, type, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                                        lineNumber: 161,
                                                        columnNumber: 19
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 154,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-xs font-medium text-slate-600",
                                            children: "Etapa de Venta"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 166,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: form.sales_stage,
                                            onChange: (e)=>setForm({
                                                    ...form,
                                                    sales_stage: e.target.value
                                                }),
                                            className: "w-full p-2 text-sm border rounded-lg",
                                            children: salesStages.map((stage)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: stage.value,
                                                    children: stage.label
                                                }, stage.value, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                                    lineNumber: 173,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                            lineNumber: 167,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 165,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 151,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 pt-4 border-t",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 180,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: saving,
                                    className: "px-4 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50",
                                    children: saving ? "Guardando..." : client ? "Actualizar" : "Crear Cliente"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                            lineNumber: 179,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
                    lineNumber: 81,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
            lineNumber: 75,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx",
        lineNumber: 74,
        columnNumber: 5
    }, this);
}
_s(ClientModal, "NNMcGbFywMG5cEtOYtaxv4ZlLSU=");
_c = ClientModal;
var _c;
__turbopack_context__.k.register(_c, "ClientModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CrmScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$hooks$2f$useCrm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/hooks/useCrm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$CrmStats$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmStats.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$CrmFilters$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/CrmFilters.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$PipelineBoard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/PipelineBoard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ClientStagesTable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientStagesTable.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$OpportunityModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/OpportunityModal.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ActivityModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ActivityModal.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$SalesFunnel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/SalesFunnel.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ClientModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/components/ClientModal.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function CrmScreen({ orgSlug }) {
    _s();
    const crm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$hooks$2f$useCrm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCrm"])(orgSlug);
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("pipeline");
    if (crm.loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-slate-500",
                children: "Cargando CRM..."
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 21,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
            lineNumber: 20,
            columnNumber: 7
        }, this);
    }
    if (crm.error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center h-64",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-500",
                children: [
                    "Error: ",
                    crm.error
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 29,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
            lineNumber: 28,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5 max-w-full mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-semibold text-slate-800",
                                children: "CRM - Pipeline de Ventas"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 38,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "Gestión del ciclo de ventas y seguimiento de clientes"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 41,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 37,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: crm.openNewClient,
                                className: "px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700",
                                children: "+ Nuevo Cliente"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 47,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: crm.openNewOpportunity,
                                className: "px-3 py-2 bg-slate-900 text-white rounded-lg text-xs hover:bg-slate-800",
                                children: "+ Nueva Oportunidad"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 53,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 46,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 36,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$CrmStats$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                stats: crm.stats
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl shadow-sm overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            className: "flex",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("pipeline"),
                                    className: `px-4 py-3 text-sm font-medium ${activeTab === "pipeline" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`,
                                    children: "Pipeline"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 67,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("clients"),
                                    className: `px-4 py-3 text-sm font-medium ${activeTab === "clients" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`,
                                    children: "Clientes por Etapa"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("all-clients"),
                                    className: `px-4 py-3 text-sm font-medium ${activeTab === "all-clients" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`,
                                    children: [
                                        "Todos los Clientes (",
                                        crm.clients.length,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setActiveTab("funnel"),
                                    className: `px-4 py-3 text-sm font-medium ${activeTab === "funnel" ? "border-b-2 border-slate-900 text-slate-900" : "text-slate-500 hover:text-slate-700"}`,
                                    children: "Embudo de Ventas"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                            lineNumber: 66,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 65,
                        columnNumber: 9
                    }, this),
                    activeTab === "pipeline" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$PipelineBoard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            pipelineData: crm.pipelineData,
                            onMoveOpportunity: crm.moveOpportunityToStage,
                            onEditOpportunity: crm.openEditOpportunity,
                            onDeleteOpportunity: crm.deleteOpportunity,
                            onAddActivity: crm.openActivityModal,
                            onMarkWon: crm.markOpportunityWon,
                            onMarkLost: crm.markOpportunityLost
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                            lineNumber: 112,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 111,
                        columnNumber: 11
                    }, this),
                    activeTab === "clients" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-4 py-3 border-b",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$CrmFilters$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    search: crm.search,
                                    setSearch: crm.setSearch,
                                    stageFilter: crm.stageFilter,
                                    setStageFilter: crm.setStageFilter,
                                    stages: crm.stages
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 127,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 126,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ClientStagesTable$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    clientsByStage: crm.clientsByStage,
                                    stages: crm.stages,
                                    onViewOpportunities: crm.openEditOpportunity
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 136,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 135,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true),
                    activeTab === "all-clients" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    placeholder: "Buscar cliente...",
                                    value: crm.search,
                                    onChange: (e)=>crm.setSearch(e.target.value),
                                    className: "w-full max-w-md p-2 text-sm border rounded-lg"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                    lineNumber: 148,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 147,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                                className: "w-full text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                        className: "bg-slate-50 border-b",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-3 font-medium text-slate-600",
                                                    children: "Nombre"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 159,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-3 font-medium text-slate-600",
                                                    children: "Teléfono"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 160,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-3 font-medium text-slate-600",
                                                    children: "Ciudad"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 161,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-3 font-medium text-slate-600",
                                                    children: "Tipo Animal"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 162,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-left p-3 font-medium text-slate-600",
                                                    children: "Etapa"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 163,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "text-center p-3 font-medium text-slate-600",
                                                    children: "Acciones"
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 164,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                            lineNumber: 158,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                        lineNumber: 157,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                        children: [
                                            crm.clients.filter((c)=>{
                                                if (!crm.search) return true;
                                                const term = crm.search.toLowerCase();
                                                const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
                                                return name.includes(term) || c.phone?.includes(term) || c.city?.toLowerCase().includes(term);
                                            }).map((client)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                    className: "border-b hover:bg-slate-50",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3 font-medium",
                                                            children: [
                                                                client.first_name,
                                                                " ",
                                                                client.last_name
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 177,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3 text-slate-500",
                                                            children: client.phone || "-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 178,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3 text-slate-500",
                                                            children: client.city || "-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 179,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3 text-slate-500",
                                                            children: client.animal_type || "-"
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 180,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "px-2 py-1 text-xs rounded-full bg-slate-100 text-slate-700",
                                                                children: client.sales_stage || "prospecto"
                                                            }, void 0, false, {
                                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                                lineNumber: 182,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 181,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                            className: "p-3 text-center",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>crm.openEditClient(client),
                                                                    className: "text-blue-600 hover:underline text-xs mr-2",
                                                                    children: "Editar"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                                    lineNumber: 187,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>{
                                                                        if (confirm("¿Eliminar este cliente?")) {
                                                                            crm.deleteClient(client.id);
                                                                        }
                                                                    },
                                                                    className: "text-red-600 hover:underline text-xs",
                                                                    children: "Eliminar"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                                    lineNumber: 193,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                            lineNumber: 186,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, client.id, true, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 176,
                                                    columnNumber: 21
                                                }, this)),
                                            crm.clients.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    colSpan: "6",
                                                    className: "p-8 text-center text-slate-400",
                                                    children: 'No hay clientes. Haz clic en "+ Nuevo Cliente" para agregar uno.'
                                                }, void 0, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                    lineNumber: 208,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                                lineNumber: 207,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                                lineNumber: 156,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 146,
                        columnNumber: 11
                    }, this),
                    activeTab === "funnel" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$SalesFunnel$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            pipelineData: crm.pipelineData
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                            lineNumber: 220,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                        lineNumber: 219,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$OpportunityModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: crm.isOpportunityModalOpen,
                onClose: crm.closeOpportunityModal,
                onSave: crm.saveOpportunity,
                opportunity: crm.editingOpportunity,
                stages: crm.stages,
                clients: crm.clients
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ActivityModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: crm.isActivityModalOpen,
                onClose: crm.closeActivityModal,
                onSave: crm.saveActivity,
                opportunity: crm.selectedOpportunityForActivity
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 234,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$components$2f$ClientModal$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: crm.isClientModalOpen,
                onClose: crm.closeClientModal,
                onSave: crm.saveClient,
                client: crm.editingClient
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
                lineNumber: 241,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(CrmScreen, "7Dj/gHprucCfHcZ9O+/yB/AJs+A=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$hooks$2f$useCrm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCrm"]
    ];
});
_c = CrmScreen;
var _c;
__turbopack_context__.k.register(_c, "CrmScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/crm/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CrmPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$CrmScreen$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/crm/CrmScreen.jsx [app-client] (ecmascript)");
"use client";
;
;
async function CrmPage({ params }) {
    const { orgSlug } = await params;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$crm$2f$CrmScreen$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
        orgSlug: orgSlug
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/crm/page.jsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
_c = CrmPage;
var _c;
__turbopack_context__.k.register(_c, "CrmPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_proyectos%20coding_agro-erp-production-2_b33f4c63._.js.map