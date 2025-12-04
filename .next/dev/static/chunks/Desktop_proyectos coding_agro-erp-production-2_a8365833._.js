(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/inventoryService.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "inventoryService",
    ()=>inventoryService
]);
const inventoryService = {
    async getInventory (orgSlug, branchName = null) {
        const response = await fetch(`/api/inventory`, {
            headers: {
                "x-org-slug": orgSlug
            }
        });
        const data = await response.json();
        const items = data.inventory ?? [];
        if (branchName) {
            return items.filter((i)=>i.branches?.name === branchName);
        }
        return items;
    },
    async decreaseStock (orgSlug, productId, branchId, qty) {
        const res = await fetch("/api/inventory/movements", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-org-slug": orgSlug
            },
            body: JSON.stringify({
                productId,
                branchId,
                qty,
                type: "salida"
            })
        });
        return await res.json();
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useBranchStore.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useBranchStore",
    ()=>useBranchStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
"use client";
;
const useBranchStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set)=>({
        branches: [
            {
                id: "masatepe",
                name: "Bodega Masatepe"
            },
            {
                id: "diriomo",
                name: "Bodega Diriomo"
            }
        ],
        activeBranch: "masatepe",
        setBranch: (branch)=>set({
                activeBranch: branch
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/utils/generateInvoiceNumber.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateInvoiceNumber",
    ()=>generateInvoiceNumber
]);
function generateInvoiceNumber() {
    const n = Math.floor(Math.random() * 900000) + 100000;
    return "FAC-" + n;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/salesService.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "salesService",
    ()=>salesService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$inventoryService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/inventoryService.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$utils$2f$generateInvoiceNumber$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/utils/generateInvoiceNumber.js [app-client] (ecmascript)");
;
;
const salesService = {
    async makeSale ({ orgId, orgSlug, branchId, client, cart, paymentType, notes }) {
        if (!orgId) throw new Error("Missing orgId");
        if (!client?.id) throw new Error("Seleccione un cliente.");
        if (!cart || cart.length === 0) throw new Error("El carrito está vacío.");
        const invoice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$utils$2f$generateInvoiceNumber$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["generateInvoiceNumber"])();
        const total = cart.reduce((sum, p)=>sum + p.qty * p.price, 0);
        // 1️⃣ Build items in the exact format your API expects
        const itemsPayload = cart.map((p)=>({
                product_id: p.id,
                quantity: p.qty,
                price: Number(p.price),
                cost: Number(p.cost ?? 0)
            }));
        // 2️⃣ Make the request to your real route
        const res = await fetch("/api/sales/create-with-items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-org-id": orgId
            },
            body: JSON.stringify({
                client_id: client.id,
                payment_method: paymentType || "cash",
                notes: notes || null,
                total,
                items: itemsPayload
            })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Error creando venta.");
        }
        // 3️⃣ Decrease inventory for each item (you also do RPC)
        for (const item of cart){
            await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$inventoryService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inventoryService"].decreaseStock(orgSlug, item.id, branchId, item.qty);
        }
        // 4️⃣ Return sale with invoice
        return {
            ...data.sale,
            invoice_number: invoice,
            items: cart,
            total
        };
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePosStore",
    ()=>usePosStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$salesService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/salesService.js [app-client] (ecmascript)");
"use client"; // ← ESTO ES OBLIGATORIO PARA QUE NEXTJS LO ANALICE
;
;
const usePosStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        cart: [],
        selectedClient: null,
        customerForm: {
            firstName: "",
            lastName: "",
            address: "",
            city: "",
            state: "",
            country: "",
            phone: "",
            ruc: ""
        },
        setCustomerField: (field, value)=>set((state)=>({
                    customerForm: {
                        ...state.customerForm,
                        [field]: value
                    }
                })),
        setClient: (client)=>set({
                selectedClient: client
            }),
        clearClient: ()=>set({
                selectedClient: null
            }),
        addToCart: (product)=>set((state)=>{
                const exists = state.cart.find((c)=>c.id === product.id);
                if (exists) {
                    return {
                        cart: state.cart.map((c)=>c.id === product.id ? {
                                ...c,
                                qty: c.qty + 1
                            } : c)
                    };
                }
                return {
                    cart: [
                        ...state.cart,
                        {
                            ...product,
                            qty: 1
                        }
                    ]
                };
            }),
        removeFromCart: (id)=>set((state)=>({
                    cart: state.cart.filter((c)=>c.id !== id)
                })),
        clearCart: ()=>set({
                cart: []
            }),
        checkout: async ({ paymentMethod, discount, received, change })=>{
            const state = get();
            if (!state.selectedClient) throw new Error("Seleccione un cliente antes de finalizar.");
            if (state.cart.length === 0) throw new Error("El carrito está vacío.");
            const orgSlug = localStorage.getItem("activeOrgSlug");
            const orgId = localStorage.getItem("activeOrgId");
            const branchId = localStorage.getItem("activeBranchId");
            if (!orgSlug || !orgId || !branchId) throw new Error("Faltan datos de organización o sucursal.");
            const saleData = {
                orgSlug,
                orgId,
                client: state.selectedClient,
                cart: state.cart,
                paymentType: paymentMethod,
                discount,
                received,
                change,
                branch: state.selectedClient?.branch,
                branchId
            };
            const sale = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$salesService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["salesService"].makeSale(saleData);
            set({
                cart: []
            });
            return sale.id;
        }
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function ProductCard({ product }) {
    _s();
    const addToCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "ProductCard.usePosStore[addToCart]": (s)=>s.addToCart
    }["ProductCard.usePosStore[addToCart]"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        onClick: ()=>addToCart(product),
        className: "bg-white border rounded-md p-2 shadow-sm hover:shadow-md transition cursor-pointer select-none",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-semibold text-[11px] leading-tight",
                children: product.name
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[9px] text-slate-500",
                children: product.category
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-1 font-bold text-slate-800 text-xs",
                children: [
                    "C$ ",
                    product.price
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                className: "mt-2 bg-slate-900 text-white text-[9px] px-2 py-1 rounded w-full",
                onClick: (e)=>{
                    e.stopPropagation();
                    addToCart(product);
                },
                children: "Agregar"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx",
                lineNumber: 28,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx",
        lineNumber: 10,
        columnNumber: 5
    }, this);
}
_s(ProductCard, "qFqKD8Qeg6e3Z7WEfjDkHd94y3Y=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"]
    ];
});
_c = ProductCard;
var _c;
__turbopack_context__.k.register(_c, "ProductCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/clientsService.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clientsService",
    ()=>clientsService
]);
const clientsService = {
    async searchClients (orgSlug, query) {
        if (!query || query.length < 2) return [];
        const res = await fetch(`/api/clients`, {
            method: "GET",
            headers: {
                "x-org-slug": orgSlug
            }
        });
        const list = await res.json();
        query = query.toLowerCase();
        return list.filter((c)=>c.name.toLowerCase().includes(query) || c.phone?.includes(query) || c.ruc?.toLowerCase().includes(query));
    },
    async getClientById (orgSlug, id) {
        const res = await fetch(`/api/clients/${id}`, {
            headers: {
                "x-org-slug": orgSlug
            }
        });
        return await res.json();
    },
    async createClient (orgSlug, data) {
        const res = await fetch(`/api/clients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-org-slug": orgSlug
            },
            body: JSON.stringify(data)
        });
        return await res.json();
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomerSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$clientsService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/clientsService.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function CustomerSelector() {
    _s();
    const setClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CustomerSelector.usePosStore[setClient]": (s)=>s.setClient
    }["CustomerSelector.usePosStore[setClient]"]);
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [clients, setClients] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    // Buscar clientes del CRM
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomerSelector.useEffect": ()=>{
            const fetchClients = {
                "CustomerSelector.useEffect.fetchClients": async ()=>{
                    const data = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$clientsService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clientsService"].searchClients(query);
                    setClients(data);
                }
            }["CustomerSelector.useEffect.fetchClients"];
            fetchClients();
        }
    }["CustomerSelector.useEffect"], [
        query
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border rounded-xl p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-medium mb-2",
                children: "Buscar cliente"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                lineNumber: 24,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "text",
                value: query,
                placeholder: "Nombre, teléfono o ruc...",
                onChange: (e)=>setQuery(e.target.value),
                className: "w-full text-xs p-2 border rounded-lg"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                lineNumber: 26,
                columnNumber: 7
            }, this),
            query.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl mt-2 max-h-40 overflow-y-auto",
                children: clients.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        onClick: ()=>{
                            setClient(c);
                            setQuery("");
                        },
                        className: "px-3 py-2 hover:bg-slate-100 text-xs cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-medium",
                                children: c.name
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                                lineNumber: 45,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[10px] text-slate-500",
                                children: c.phone
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                                lineNumber: 46,
                                columnNumber: 15
                            }, this)
                        ]
                    }, c.id, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                        lineNumber: 37,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
                lineNumber: 35,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_s(CustomerSelector, "xeoMxNNjeyk8+m6wwmrk+pQpuBI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"]
    ];
});
_c = CustomerSelector;
var _c;
__turbopack_context__.k.register(_c, "CustomerSelector");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomerHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CustomerHeader() {
    _s();
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CustomerHeader.usePosStore[client]": (s)=>s.selectedClient
    }["CustomerHeader.usePosStore[client]"]);
    if (!client) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3 bg-slate-50 rounded-xl border text-xs text-slate-400",
        children: "Ningún cliente seleccionado"
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
        lineNumber: 10,
        columnNumber: 7
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-3 bg-blue-50 rounded-xl border border-blue-300 text-xs space-y-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-bold text-blue-900",
                children: client.name
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
                lineNumber: 17,
                columnNumber: 7
            }, this),
            client.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: [
                    "📞 ",
                    client.phone
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
                lineNumber: 18,
                columnNumber: 24
            }, this),
            client.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: [
                    "📍 ",
                    client.address
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
                lineNumber: 19,
                columnNumber: 26
            }, this),
            client.ruc && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                children: [
                    "🧾 RUC: ",
                    client.ruc
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
                lineNumber: 20,
                columnNumber: 22
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
_s(CustomerHeader, "waFkzLLnJRSctCHPKqi57BxG5FY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"]
    ];
});
_c = CustomerHeader;
var _c;
__turbopack_context__.k.register(_c, "CustomerHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CustomerForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CustomerForm() {
    _s();
    const customer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CustomerForm.usePosStore[customer]": (s)=>s.customerForm
    }["CustomerForm.usePosStore[customer]"]);
    const setField = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CustomerForm.usePosStore[setField]": (s)=>s.setCustomerField
    }["CustomerForm.usePosStore[setField]"]);
    const fields = [
        {
            label: "Nombre",
            key: "firstName"
        },
        {
            label: "Apellido",
            key: "lastName"
        },
        {
            label: "Teléfono",
            key: "phone"
        },
        {
            label: "Dirección",
            key: "address"
        },
        {
            label: "Municipio",
            key: "city"
        },
        {
            label: "Ciudad",
            key: "state"
        },
        {
            label: "País",
            key: "country"
        },
        {
            label: "RUC/Cédula",
            key: "ruc"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border rounded-lg p-3 space-y-2 shadow-sm",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-xs font-semibold mb-1",
                children: "Datos del Cliente"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-2",
                children: fields.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            placeholder: f.label,
                            value: customer[f.key],
                            onChange: (e)=>setField(f.key, e.target.value),
                            className: "w-full border rounded-md p-1.5 text-[11px] focus:ring-1 focus:ring-blue-400"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx",
                            lineNumber: 27,
                            columnNumber: 13
                        }, this)
                    }, f.key, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx",
                        lineNumber: 26,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx",
                lineNumber: 24,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_s(CustomerForm, "z7BEw74duOx5OFiubvqEiuo8sQM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"]
    ];
});
_c = CustomerForm;
var _c;
__turbopack_context__.k.register(_c, "CustomerForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/utils/formatCurrency.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "formatCurrency",
    ()=>formatCurrency
]);
const formatCurrency = (n)=>"C$ " + n.toLocaleString("es-NI", {
        minimumFractionDigits: 2
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useCashRegisterStore.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCashRegisterStore",
    ()=>useCashRegisterStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)");
"use client";
;
const useCashRegisterStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$react$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["create"])((set, get)=>({
        // 🟢 ESTADO DE CAJA
        isOpen: false,
        openingAmount: 0,
        openingTime: null,
        closingTime: null,
        branch: null,
        user: null,
        movements: [],
        // 🟢 ABRIR CAJA
        openCashRegister: ({ amount, user, branch })=>set({
                isOpen: true,
                openingAmount: amount,
                branch,
                user,
                openingTime: new Date(),
                movements: [],
                closingTime: null
            }),
        // 🟣 REGISTRAR MOVIMIENTO
        addMovement: (movement)=>set((state)=>({
                    movements: [
                        ...state.movements,
                        movement
                    ]
                })),
        // 🟤 CALCULAR TOTAL EN CAJA
        getTotal: ()=>{
            const { openingAmount, movements } = get();
            let income = 0;
            let expense = 0;
            for (const m of movements){
                if (m.type === "entrada") income += m.amount;
                if (m.type === "salida") expense += m.amount;
            }
            return openingAmount + income - expense;
        },
        // 🔴 CERRAR CAJA
        closeCashRegister: ()=>set({
                isOpen: false,
                closingTime: new Date()
            })
    }));
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CartSidebar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/usePosStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerSelector$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerSelector.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerHeader$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerHeader.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CustomerForm.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$utils$2f$formatCurrency$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/utils/formatCurrency.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$salesService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/salesService.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useCashRegisterStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useCashRegisterStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useBranchStore.js [app-client] (ecmascript)");
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
function CartSidebar() {
    _s();
    const cart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CartSidebar.usePosStore[cart]": (s)=>s.cart
    }["CartSidebar.usePosStore[cart]"]);
    const clearCart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CartSidebar.usePosStore[clearCart]": (s)=>s.clearCart
    }["CartSidebar.usePosStore[clearCart]"]);
    const client = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CartSidebar.usePosStore[client]": (s)=>s.selectedClient
    }["CartSidebar.usePosStore[client]"]);
    const branch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"])({
        "CartSidebar.useBranchStore[branch]": (s)=>s.activeBranch
    }["CartSidebar.useBranchStore[branch]"]);
    const isCashOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useCashRegisterStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCashRegisterStore"])({
        "CartSidebar.useCashRegisterStore[isCashOpen]": (s)=>s.isOpen
    }["CartSidebar.useCashRegisterStore[isCashOpen]"]);
    const addMovement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useCashRegisterStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCashRegisterStore"])({
        "CartSidebar.useCashRegisterStore[addMovement]": (s)=>s.addMovement
    }["CartSidebar.useCashRegisterStore[addMovement]"]);
    const customerForm = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"])({
        "CartSidebar.usePosStore[customerForm]": (s)=>s.customerForm
    }["CartSidebar.usePosStore[customerForm]"]);
    const total = cart.reduce((acc, item)=>acc + item.qty * item.price, 0);
    const handleSale = async ()=>{
        try {
            if (!isCashOpen) {
                alert("Abra la caja antes de vender.");
                return;
            }
            const sale = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$salesService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["salesService"].makeSale({
                client: client || customerForm,
                cart,
                paymentType: "efectivo",
                branch
            });
            addMovement({
                type: "entrada",
                amount: sale.total,
                description: `Venta ${sale.invoice}`,
                time: new Date()
            });
            clearCart();
            alert(`Venta realizada. Factura: ${sale.invoice}`);
        } catch (error) {
            alert(error.message);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border rounded-xl shadow-md h-full p-3 flex flex-col space-y-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerHeader$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerSelector$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                lineNumber: 64,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CustomerForm$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto mt-2 space-y-2 pr-1",
                children: cart.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 p-2 rounded-lg border border-slate-200 shadow-sm",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between items-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs font-semibold",
                                            children: item.name
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                            lineNumber: 78,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-[10px] text-slate-500",
                                            children: [
                                                item.qty,
                                                " x C$ ",
                                                item.price
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                            lineNumber: 79,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                    lineNumber: 77,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-bold",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$utils$2f$formatCurrency$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(item.qty * item.price)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                    lineNumber: 83,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                            lineNumber: 76,
                            columnNumber: 13
                        }, this)
                    }, item.id, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                        lineNumber: 72,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                lineNumber: 70,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t pt-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-between text-xs font-bold mb-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Total"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                lineNumber: 94,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$utils$2f$formatCurrency$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatCurrency"])(total)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                                lineNumber: 95,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-xs font-semibold",
                        onClick: handleSale,
                        children: "Finalizar Venta"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                        lineNumber: 98,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: clearCart,
                        className: "w-full mt-2 bg-slate-300 text-slate-800 py-1.5 rounded-lg text-[10px]",
                        children: "Vaciar Carrito"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                        lineNumber: 105,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
                lineNumber: 92,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(CartSidebar, "5u8rOVxxpXlQ16TEW4axWDAKhPI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useCashRegisterStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCashRegisterStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useCashRegisterStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCashRegisterStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$usePosStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePosStore"]
    ];
});
_c = CartSidebar;
var _c;
__turbopack_context__.k.register(_c, "CartSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PosHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useBranchStore.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function PosHeader() {
    _s();
    const branches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"])({
        "PosHeader.useBranchStore[branches]": (s)=>s.branches
    }["PosHeader.useBranchStore[branches]"]);
    const activeBranch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"])({
        "PosHeader.useBranchStore[activeBranch]": (s)=>s.activeBranch
    }["PosHeader.useBranchStore[activeBranch]"]);
    const setBranch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"])({
        "PosHeader.useBranchStore[setBranch]": (s)=>s.setBranch
    }["PosHeader.useBranchStore[setBranch]"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between mb-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-lg font-semibold",
                children: "Punto de Venta"
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx",
                lineNumber: 12,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                className: "text-sm border rounded px-2 py-1",
                value: activeBranch,
                onChange: (e)=>setBranch(e.target.value),
                children: branches.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: b.id,
                        children: b.name
                    }, b.id, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx",
                        lineNumber: 20,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx",
                lineNumber: 14,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx",
        lineNumber: 11,
        columnNumber: 5
    }, this);
}
_s(PosHeader, "d2e/2hW+juFi/h9Gq5iGN2+nGK0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"]
    ];
});
_c = PosHeader;
var _c;
__turbopack_context__.k.register(_c, "PosHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PosScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$inventoryService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/services/inventoryService.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/store/useBranchStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$ProductCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/ProductCard.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CartSidebar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/CartSidebar.jsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$PosHeader$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/components/PosHeader.jsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function PosScreen() {
    _s();
    const branch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"])({
        "PosScreen.useBranchStore[branch]": (s)=>s.activeBranch
    }["PosScreen.useBranchStore[branch]"]);
    const [products, setProducts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PosScreen.useEffect": ()=>{
            async function load() {
                const data = await __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$services$2f$inventoryService$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["inventoryService"].getInventory(branch);
                // ALWAYS extract array safely
                const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];
                setProducts(list);
            }
            load();
        }
    }["PosScreen.useEffect"], [
        branch
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid grid-cols-12 gap-4 h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "col-span-12",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$PosHeader$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                lineNumber: 37,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "col-span-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2",
                children: products.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-slate-500 text-sm col-span-full",
                    children: [
                        "No hay productos para esta bodega (",
                        branch,
                        ")"
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this) : products.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$ProductCard$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        product: p
                    }, p.id, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                        lineNumber: 49,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "col-span-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$components$2f$CartSidebar$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                    lineNumber: 56,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
                lineNumber: 55,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx",
        lineNumber: 35,
        columnNumber: 5
    }, this);
}
_s(PosScreen, "JKzXL1Fq38JOFU3DQEqY3MSX/D8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$store$2f$useBranchStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useBranchStore"]
    ];
});
_c = PosScreen;
var _c;
__turbopack_context__.k.register(_c, "PosScreen");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/pos/page.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PosPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$PosScreen$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/POS/PosScreen.jsx [app-client] (ecmascript)");
"use client";
;
;
function PosPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$POS$2f$PosScreen$2e$jsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/pos/page.jsx",
        lineNumber: 6,
        columnNumber: 10
    }, this);
}
_c = PosPage;
var _c;
__turbopack_context__.k.register(_c, "PosPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createStore",
    ()=>createStore
]);
const createStoreImpl = (createState)=>{
    let state;
    const listeners = /* @__PURE__ */ new Set();
    const setState = (partial, replace)=>{
        const nextState = typeof partial === "function" ? partial(state) : partial;
        if (!Object.is(nextState, state)) {
            const previousState = state;
            state = (replace != null ? replace : typeof nextState !== "object" || nextState === null) ? nextState : Object.assign({}, state, nextState);
            listeners.forEach((listener)=>listener(state, previousState));
        }
    };
    const getState = ()=>state;
    const getInitialState = ()=>initialState;
    const subscribe = (listener)=>{
        listeners.add(listener);
        return ()=>listeners.delete(listener);
    };
    const api = {
        setState,
        getState,
        getInitialState,
        subscribe
    };
    const initialState = state = createState(setState, getState, api);
    return api;
};
const createStore = (createState)=>createState ? createStoreImpl(createState) : createStoreImpl;
;
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/react.mjs [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "create",
    ()=>create,
    "useStore",
    ()=>useStore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/zustand/esm/vanilla.mjs [app-client] (ecmascript)");
;
;
const identity = (arg)=>arg;
function useStore(api, selector = identity) {
    const slice = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useSyncExternalStore(api.subscribe, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]), __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useStore.useSyncExternalStore[slice]": ()=>selector(api.getInitialState())
    }["useStore.useSyncExternalStore[slice]"], [
        api,
        selector
    ]));
    __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useDebugValue(slice);
    return slice;
}
const createImpl = (createState)=>{
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$zustand$2f$esm$2f$vanilla$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])(createState);
    const useBoundStore = (selector)=>useStore(api, selector);
    Object.assign(useBoundStore, api);
    return useBoundStore;
};
const create = (createState)=>createState ? createImpl(createState) : createImpl;
;
}),
]);

//# sourceMappingURL=Desktop_proyectos%20coding_agro-erp-production-2_a8365833._.js.map