module.exports = [
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/hooks/useInventory.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CATEGORIES",
    ()=>CATEGORIES,
    "useInventory",
    ()=>useInventory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
const CATEGORIES = [
    "Alimentos",
    "Medicinas",
    "Accesorios",
    "Herramientas",
    "Otros"
];
function useInventory(orgSlug) {
    const [inventory, setInventory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [branches, setBranches] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [category, setCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("TODOS");
    const [branch, setBranch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("TODAS");
    const [lowStockOnly, setLowStockOnly] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingProduct, setEditingProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    /* ===========================================================
   * LOAD INVENTORY
   * =========================================================== */ async function loadInventory() {
        try {
            setLoading(true);
            const res = await fetch("/api/inventory/stock", {
                headers: {
                    "x-org-slug": orgSlug
                }
            });
            const json = await res.json();
            console.log("INVENTORY RAW JSON:", json);
            if (json.stock) {
                const mapped = json.stock.map((item)=>({
                        id: `${item.product_id}-${item.branch_id}`,
                        productId: item.product_id,
                        branchId: item.branch_id,
                        branch: item.branch_name ?? "Sin sucursal",
                        name: item.name,
                        sku: item.sku ?? item.product_id,
                        category: item.category,
                        stock: Number(item.stock ?? 0),
                        minStock: item.min_stock ?? 0,
                        cost: item.cost ?? 0,
                        price: item.price ?? 0,
                        unitWeight: item.unit_weight ?? 0,
                        expiresAt: item.expires_at ?? null
                    }));
                console.log("INVENTORY MAPPED:", mapped);
                setInventory(mapped);
            }
            if (json.branches) setBranches(json.branches);
        } catch (err) {
            console.error("Inventory fetch error:", err);
        } finally{
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (orgSlug) loadInventory();
    }, [
        orgSlug
    ]);
    const getStock = (p)=>Number(p.stock ?? 0);
    /* ===========================================================
   * FILTERED PRODUCTS
   * =========================================================== */ const filteredProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const term = search.toLowerCase();
        return inventory.filter((p)=>{
            const matchesCategory = category === "TODOS" || p.category === category;
            const matchesBranch = branch === "TODAS" || p.branch === branch;
            const matchesSearch = p.name?.toLowerCase().includes(term) || String(p.sku).toLowerCase().includes(term);
            const matchesLowStock = lowStockOnly ? getStock(p) <= Number(p.minStock ?? 0) : true;
            return matchesCategory && matchesBranch && matchesSearch && matchesLowStock;
        });
    }, [
        inventory,
        search,
        category,
        branch,
        lowStockOnly
    ]);
    /* ===========================================================
   * STATS
   * =========================================================== */ const stats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const totalProducts = inventory.length;
        const totalUnits = inventory.reduce((sum, p)=>sum + getStock(p), 0);
        const inventoryValue = inventory.reduce((sum, p)=>sum + getStock(p) * (p.cost ?? 0), 0);
        const potentialRevenue = inventory.reduce((sum, p)=>sum + getStock(p) * (p.price ?? 0), 0);
        const lowStockCount = inventory.filter((p)=>getStock(p) <= Number(p.minStock ?? 0)).length;
        return {
            totalProducts,
            totalUnits,
            inventoryValue,
            potentialRevenue,
            lowStockCount
        };
    }, [
        inventory
    ]);
    /* ===========================================================
   * MODAL HANDLERS
   * =========================================================== */ function openNewProduct() {
        setEditingProduct(null);
        setIsModalOpen(true);
    }
    function openEditProduct(product) {
        setEditingProduct(product);
        setIsModalOpen(true);
    }
    function closeModal() {
        setIsModalOpen(false);
        setEditingProduct(null);
    }
    /* ===========================================================
   * SAVE PRODUCT
   * =========================================================== */ async function saveProduct(data) {
        try {
            const method = data.productId ? "PUT" : "POST";
            const res = await fetch("/api/products", {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "x-org-slug": orgSlug
                },
                body: JSON.stringify({
                    id: data.productId,
                    name: data.name,
                    sku: data.sku,
                    category: data.category,
                    unitWeight: data.unitWeight,
                    minStock: data.minStock,
                    cost: data.cost,
                    price: data.price,
                    expiresAt: data.expiresAt,
                    branchId: data.branchId
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Error al guardar producto");
            }
            await loadInventory();
            closeModal();
            return {
                success: true
            };
        } catch (err) {
            console.error("Save product error:", err);
            return {
                success: false,
                error: err.message
            };
        }
    }
    /* ===========================================================
   * DELETE PRODUCT
   * =========================================================== */ async function deleteProduct(id) {
        try {
            const product = inventory.find((p)=>p.id === id);
            if (!product) return {
                success: false,
                error: "Producto no encontrado"
            };
            const res = await fetch("/api/inventory", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "x-org-slug": orgSlug
                },
                body: JSON.stringify({
                    productId: product.productId
                })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Error al eliminar producto");
            }
            setInventory((prev)=>prev.filter((p)=>p.productId !== product.productId));
            return {
                success: true
            };
        } catch (err) {
            console.error("Delete product error:", err);
            return {
                success: false,
                error: err.message
            };
        }
    }
    /* ===========================================================
   * RETURN
   * =========================================================== */ return {
        products: inventory,
        filteredProducts,
        stats,
        branches,
        search,
        setSearch,
        category,
        setCategory,
        branch,
        setBranch,
        lowStockOnly,
        setLowStockOnly,
        isModalOpen,
        editingProduct,
        openNewProduct,
        openEditProduct,
        closeModal,
        saveProduct,
        deleteProduct,
        loadInventory,
        loading,
        setProducts: setInventory
    };
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryFilters
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
"use client";
;
;
;
function InventoryFilters({ search, setSearch, category, setCategory, branch, setBranch, lowStockOnly, setLowStockOnly, categories = [], branches = [] }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-end gap-4 mb-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-w-[220px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-slate-600",
                        children: "Buscar"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 23,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "h-4 w-4 text-slate-400 absolute left-3 top-[10px]"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Nombre o código...",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                className: " w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition "
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                lineNumber: 28,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                lineNumber: 22,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-[160px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-slate-600",
                        children: "Categoría"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: category,
                        onChange: (e)=>setCategory(e.target.value),
                        className: " w-full border border-slate-300 rounded-xl text-sm py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "TODOS",
                                children: "Todas"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                lineNumber: 64,
                                columnNumber: 11
                            }, this),
                            categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: c,
                                    children: c
                                }, c, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                    lineNumber: 66,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 51,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-[160px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "text-xs font-semibold text-slate-600",
                        children: "Bodega"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 73,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        value: branch,
                        onChange: (e)=>setBranch(e.target.value),
                        className: " w-full border border-slate-300 rounded-xl text-sm py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "TODAS",
                                children: "Todas"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                lineNumber: 89,
                                columnNumber: 11
                            }, this),
                            branches.map((b)=>{
                                const name = typeof b === "string" ? b : b.name;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: name,
                                    children: name
                                }, name, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                                    lineNumber: 92,
                                    columnNumber: 20
                                }, this);
                            })
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 76,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                lineNumber: 72,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 pt-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "lowStock",
                        type: "checkbox",
                        checked: lowStockOnly,
                        onChange: (e)=>setLowStockOnly(e.target.checked),
                        className: "h-4 w-4 accent-blue-600"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 99,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        htmlFor: "lowStock",
                        className: "text-xs text-slate-700",
                        children: "Solo bajo stock"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                        lineNumber: 106,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
                lineNumber: 98,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryGrid
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function computeDaysToExpire(expiresAt) {
    if (!expiresAt) return null;
    const today = new Date();
    const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const exp = new Date(expiresAt + "T00:00:00");
    return Math.ceil((exp - base) / (1000 * 60 * 60 * 24));
}
function InventoryGrid({ products, stats, onEdit, onDelete, onEntry, onExit, onTransfer, onKardex, orgSlug }) {
    const safeProducts = Array.isArray(products) ? products : [];
    const [deleteConfirm, setDeleteConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const getStock = (p)=>p.stock ?? p.quantity ?? 0;
    const getUnitWeight = (p)=>p.unitWeight ?? p.unidad_medida ?? p.unit_medida ?? 0;
    const [sortConfig, setSortConfig] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        key: "name",
        direction: "asc"
    });
    const getSortValue = (p, key)=>{
        switch(key){
            case "costTotal":
                return getStock(p) * (p.cost ?? 0);
            case "pricePerLb":
                {
                    const w = getUnitWeight(p);
                    return p.price && w ? p.price / w : null;
                }
            case "daysToExpire":
                return computeDaysToExpire(p.expiresAt);
            default:
                return p[key];
        }
    };
    const sortedProducts = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const arr = [
            ...safeProducts
        ];
        if (!sortConfig.key) return arr;
        return arr.sort((a, b)=>{
            const va = getSortValue(a, sortConfig.key);
            const vb = getSortValue(b, sortConfig.key);
            if (va == null) return 1;
            if (vb == null) return -1;
            if (va < vb) return sortConfig.direction === "asc" ? -1 : 1;
            if (va > vb) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    }, [
        safeProducts,
        sortConfig
    ]);
    const { totalProducts = safeProducts.length, totalUnits = safeProducts.reduce((sum, p)=>sum + getStock(p), 0), inventoryValue = safeProducts.reduce((sum, p)=>sum + getStock(p) * (p.cost ?? 0), 0), potentialRevenue = safeProducts.reduce((sum, p)=>sum + getStock(p) * (p.price ?? 0), 0) } = stats || {};
    const handleDeleteClick = (product)=>setDeleteConfirm(product);
    const confirmDelete = async ()=>{
        if (deleteConfirm && onDelete) {
            await onDelete(deleteConfirm.id);
            setDeleteConfirm(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-3",
        children: [
            deleteConfirm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold text-slate-800",
                            children: "Confirmar eliminación"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-slate-600 my-4",
                            children: [
                                "¿Eliminar ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: deleteConfirm.name
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                    lineNumber: 103,
                                    columnNumber: 25
                                }, this),
                                "? Esta acción es permanente."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                            lineNumber: 102,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setDeleteConfirm(null),
                                    className: "px-4 py-2 bg-slate-200 rounded",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                    lineNumber: 107,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: confirmDelete,
                                    className: "px-4 py-2 bg-red-600 text-white rounded",
                                    children: "Eliminar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                            lineNumber: 106,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                    lineNumber: 97,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                lineNumber: 96,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 border rounded-lg px-3 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500",
                                children: "Productos"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 127,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-semibold",
                                children: totalProducts
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 128,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 border rounded-lg px-3 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500",
                                children: "Unidades"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-semibold",
                                children: totalUnits.toLocaleString("es-NI")
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 133,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 border rounded-lg px-3 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500",
                                children: "Valor inventario"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 139,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-semibold text-emerald-700",
                                children: [
                                    "C$ ",
                                    inventoryValue.toLocaleString("es-NI")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-slate-50 border rounded-lg px-3 py-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500",
                                children: "Potencial de venta"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 146,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-semibold text-indigo-700",
                                children: [
                                    "C$ ",
                                    potentialRevenue.toLocaleString("es-NI")
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                        lineNumber: 145,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                lineNumber: 125,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-full overflow-auto max-h-[520px]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full text-[12px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                className: "bg-slate-50 border-b text-[11px] uppercase text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2",
                                        children: "Producto"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 158,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2",
                                        children: "Código"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 159,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2",
                                        children: "Categoría"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 160,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2",
                                        children: "Bodega"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 161,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Cantidad"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 162,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Peso"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 163,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Costo"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Costo total"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 165,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Precio"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 166,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Precio x lb"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 167,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Días p/ vencer"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 168,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2",
                                        children: "Vence"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 169,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "px-2 py-2 text-right",
                                        children: "Acciones"
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                        lineNumber: 170,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 157,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                            lineNumber: 156,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: sortedProducts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    colSpan: 13,
                                    className: "px-3 py-4 text-center text-slate-400",
                                    children: "No hay productos"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                    lineNumber: 177,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                lineNumber: 176,
                                columnNumber: 15
                            }, this) : sortedProducts.map((p)=>{
                                const stock = getStock(p);
                                const weight = getUnitWeight(p);
                                const pricePerLb = p.price && weight ? p.price / weight : null;
                                const costTotal = stock * (p.cost ?? 0);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b hover:bg-slate-50 transition",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5",
                                            children: p.name
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 198,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5",
                                            children: p.sku ?? p.id
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 199,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5",
                                            children: p.category
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 200,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5",
                                            children: p.branch ?? p.branch_name
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 201,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: stock
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 202,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: weight
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 203,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: [
                                                "C$ ",
                                                p.cost?.toLocaleString("es-NI")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 204,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: [
                                                "C$ ",
                                                costTotal.toLocaleString("es-NI")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 207,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: [
                                                "C$ ",
                                                p.price?.toLocaleString("es-NI")
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 210,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: pricePerLb ? `C$ ${pricePerLb.toFixed(2)}` : "-"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 213,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: computeDaysToExpire(p.expiresAt) ?? "—"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 216,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5",
                                            children: p.expiresAt
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 219,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "px-2 py-1.5 text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end gap-1 flex-wrap",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            let pid = p.product_id ?? p.id;
                                                            pid = String(pid);
                                                            // cortar solo las 5 partes válidas UUID
                                                            const cleanUUID = pid.split("-").slice(0, 5).join("-");
                                                            onKardex({
                                                                ...p,
                                                                productId: cleanUUID
                                                            });
                                                        },
                                                        className: "px-2 py-1 text-[11px] bg-purple-600 text-white rounded hover:bg-purple-700",
                                                        children: "Historial ▸"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 226,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onEntry && onEntry(p),
                                                        className: "px-2 py-1 text-[11px] bg-emerald-600 text-white rounded",
                                                        children: "Entrada"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 247,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onExit && onExit(p),
                                                        className: "px-2 py-1 text-[11px] bg-orange-600 text-white rounded",
                                                        children: "Salida"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 254,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onTransfer && onTransfer(p),
                                                        className: "px-2 py-1 text-[11px] bg-blue-600 text-white rounded",
                                                        children: "Traslado"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 261,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>onEdit && onEdit(p),
                                                        className: "px-2 py-1 text-[11px] bg-slate-800 text-white rounded",
                                                        children: "Editar"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 268,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setDeleteConfirm(p),
                                                        className: "px-2 py-1 text-[11px] bg-red-600 text-white rounded",
                                                        children: "Eliminar"
                                                    }, void 0, false, {
                                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                        lineNumber: 275,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                                lineNumber: 223,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                            lineNumber: 222,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, p.id, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                                    lineNumber: 194,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                            lineNumber: 174,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                    lineNumber: 155,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
                lineNumber: 154,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProductFormModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function ProductFormModal({ isOpen, onClose, onSave, product, categories = [], branches = [] }) {
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        id: null,
        productId: null,
        name: "",
        sku: "",
        category: "",
        branch: "",
        branchId: "",
        unitWeight: 0,
        minStock: 0,
        cost: 0,
        price: 0,
        unit: "LB",
        expiresAt: ""
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!isOpen) return;
        const defaultBranch = branches[0];
        setForm({
            id: product?.id ?? null,
            productId: product?.productId ?? null,
            name: product?.name ?? "",
            sku: product?.sku ?? "",
            category: product?.category ?? categories[0] ?? "",
            branch: product?.branch ?? defaultBranch?.name ?? "",
            branchId: product?.branchId ?? defaultBranch?.id ?? "",
            unitWeight: product?.unitWeight ?? 0,
            minStock: product?.minStock ?? 0,
            cost: product?.cost ?? 0,
            price: product?.price ?? 0,
            unit: product?.unit ?? "LB",
            expiresAt: product?.expiresAt ?? ""
        });
    }, [
        isOpen,
        product,
        branches,
        categories
    ]);
    if (!isOpen) return null;
    function handleChange(e) {
        const { name, value } = e.target;
        const numeric = [
            "unitWeight",
            "minStock",
            "cost",
            "price"
        ];
        setForm((prev)=>({
                ...prev,
                [name]: numeric.includes(name) ? Number(value) : value
            }));
    }
    function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) return alert("El nombre es obligatorio");
        if (!form.sku.trim()) return alert("El código es obligatorio");
        onSave(form);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-base font-semibold text-slate-800",
                            children: product ? "Editar producto" : "Nuevo producto"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 74,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-xs text-slate-500 hover:text-slate-800",
                            children: "Cerrar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 77,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                            label: "Nombre",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "name",
                                value: form.name,
                                onChange: handleChange,
                                className: "input-soft",
                                placeholder: "Ej: Engordina 100 lb"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                            label: "Código / SKU",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                name: "sku",
                                value: form.sku,
                                onChange: handleChange,
                                className: "input-soft",
                                placeholder: "Ej: ENG-100"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                            label: "Fecha de vencimiento",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                name: "expiresAt",
                                value: form.expiresAt,
                                onChange: handleChange,
                                className: "input-soft"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                lineNumber: 108,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 107,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Categoría",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        name: "category",
                                        value: form.category,
                                        onChange: handleChange,
                                        className: "input-soft",
                                        children: categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                children: c
                                            }, c, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                lineNumber: 126,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                        lineNumber: 119,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 118,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Bodega",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        name: "branch",
                                        value: form.branchId,
                                        onChange: (e)=>{
                                            const selectedBranch = branches.find((b)=>b.id === e.target.value);
                                            setForm((prev)=>({
                                                    ...prev,
                                                    branch: selectedBranch?.name || "",
                                                    branchId: e.target.value
                                                }));
                                        },
                                        className: "input-soft",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "",
                                                children: "Seleccionar..."
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                lineNumber: 145,
                                                columnNumber: 17
                                            }, this),
                                            branches.map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: b.id,
                                                    children: b.name
                                                }, b.id, false, {
                                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                    lineNumber: 147,
                                                    columnNumber: 19
                                                }, this))
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                        lineNumber: 132,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 131,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
                                    label: "Unidad",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        name: "unit",
                                        value: form.unit,
                                        onChange: handleChange,
                                        className: "input-soft",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "LB",
                                                children: "LB"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                lineNumber: 159,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "KG",
                                                children: "KG"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                lineNumber: 160,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "UND",
                                                children: "UND"
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                                lineNumber: 161,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 152,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-4 gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberField, {
                                    label: "Peso (lb/kg)",
                                    name: "unitWeight",
                                    value: form.unitWeight,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 167,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberField, {
                                    label: "Stock Min",
                                    name: "minStock",
                                    value: form.minStock,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberField, {
                                    label: "Costo",
                                    name: "cost",
                                    value: form.cost,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 169,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(NumberField, {
                                    label: "Precio",
                                    name: "price",
                                    value: form.price,
                                    onChange: handleChange
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 170,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 166,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 pt-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: onClose,
                                    className: "px-4 py-2 text-xs bg-slate-200 rounded-lg hover:bg-slate-300",
                                    children: "Cancelar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 174,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "px-4 py-2 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700",
                                    children: "Guardar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                                    lineNumber: 182,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                            lineNumber: 173,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
            lineNumber: 71,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
function Field({ label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-[11px] font-semibold text-slate-600 mb-1",
                children: label
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
                lineNumber: 198,
                columnNumber: 7
            }, this),
            children
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
        lineNumber: 197,
        columnNumber: 5
    }, this);
}
function NumberField(props) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Field, {
        label: props.label,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
            type: "number",
            ...props,
            className: "input-soft"
        }, void 0, false, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
            lineNumber: 209,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx",
        lineNumber: 208,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryEntryModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function InventoryEntryModal({ isOpen, onClose, product, onSubmit }) {
    const [qty, setQty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [cost, setCost] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [expiresAt, setExpiresAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [lot, setLot] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [note, setNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (product) {
            setQty("");
            setCost(product.cost ? String(product.cost) : "");
            setExpiresAt(product.expiresAt ?? "");
            setLot(product.lot ?? "");
            setNote("");
        }
    }, [
        product
    ]);
    if (!isOpen || !product) return null;
    const handleSave = ()=>{
        const numericQty = Number(qty);
        if (!qty || isNaN(numericQty) || numericQty <= 0) {
            alert("Ingrese una cantidad válida mayor a 0");
            return;
        }
        onSubmit({
            productId: product.productId || product.id,
            qty: numericQty,
            cost: cost ? Number(cost) : product.cost,
            expiresAt,
            lot,
            note
        });
        onClose();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white w-full max-w-md rounded-xl p-5 shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-semibold text-slate-800 mb-3",
                    children: [
                        "Entrada de inventario — ",
                        product.name
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-500 mb-4",
                    children: [
                        "Sucursal: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium",
                            children: product.branch
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 56,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Cantidad a ingresar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 61,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: qty,
                                    onChange: (e)=>setQty(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: 100"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 64,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 60,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Costo unitario (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 74,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: cost,
                                    onChange: (e)=>setCost(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: 25.50"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 77,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Fecha de vencimiento (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 87,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    value: expiresAt,
                                    onChange: (e)=>setExpiresAt(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 86,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Lote (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: lot,
                                    onChange: (e)=>setLot(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: LOTE-2024-001"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Nota (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: note,
                                    onChange: (e)=>setNote(e.target.value),
                                    rows: 2,
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: compra nueva, ajuste, proveedor X"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                                    lineNumber: 115,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                    lineNumber: 59,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 mt-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-3 py-2 bg-slate-200 rounded text-xs hover:bg-slate-300",
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            className: "px-3 py-2 bg-emerald-600 text-white rounded text-xs hover:bg-emerald-700",
                            children: "Guardar entrada"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
            lineNumber: 50,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx",
        lineNumber: 49,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryExitModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function InventoryExitModal({ isOpen, onClose, product, onSubmit }) {
    const [qty, setQty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [reason, setReason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Ajuste");
    const [note, setNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (product) {
            setQty("");
            setReason("Ajuste");
            setNote("");
        }
    }, [
        product
    ]);
    if (!isOpen || !product) return null;
    const handleSave = ()=>{
        const numericQty = Number(qty);
        if (!qty || isNaN(numericQty) || numericQty <= 0) {
            alert("La cantidad debe ser mayor a 0");
            return;
        }
        if (numericQty > product.stock) {
            alert("No puedes sacar más unidades de las que hay en inventario.");
            return;
        }
        onSubmit({
            productId: product.productId || product.id,
            qty: numericQty,
            reason,
            note
        });
        onClose();
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white w-full max-w-md rounded-xl p-5 shadow-lg",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-semibold text-slate-800 mb-3",
                    children: [
                        "Salida de inventario — ",
                        product.name
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                    lineNumber: 50,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs text-slate-500 mb-4",
                    children: [
                        "Sucursal: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-medium",
                            children: product.branch
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 55,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                    lineNumber: 54,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Cantidad a descontar"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 60,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    value: qty,
                                    onChange: (e)=>setQty(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: 10"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 63,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[11px] text-slate-500 mt-1",
                                    children: [
                                        "Stock disponible: ",
                                        product.stock
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 70,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 59,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Motivo"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 76,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: reason,
                                    onChange: (e)=>setReason(e.target.value),
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Ajuste"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 84,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Merma"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 85,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Vencido"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 86,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Daño en almacenamiento"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 87,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Robo / Pérdida"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 88,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            children: "Salida manual"
                                        }, void 0, false, {
                                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                            lineNumber: 89,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 79,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 75,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: "block text-slate-600 font-medium mb-1",
                                    children: "Nota (opcional)"
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 94,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    value: note,
                                    onChange: (e)=>setNote(e.target.value),
                                    rows: 2,
                                    className: "w-full border rounded px-3 py-2 text-sm",
                                    placeholder: "Ej: bolsas rotas, producto en mal estado..."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                                    lineNumber: 97,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 mt-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-3 py-2 bg-slate-200 rounded text-xs hover:bg-slate-300",
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            className: "px-3 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700",
                            children: "Registrar salida"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
                    lineNumber: 107,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
            lineNumber: 49,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx",
        lineNumber: 48,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryTransferModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
function InventoryTransferModal({ isOpen, onClose, product, onSubmit, branches = [] }) {
    const [qty, setQty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [from, setFrom] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [to, setTo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [fromBranchId, setFromBranchId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [toBranchId, setToBranchId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (product) {
            setQty("");
            setFrom(product.branch);
            setFromBranchId(product.branchId || "");
            setTo("");
            setToBranchId("");
        }
    }, [
        product
    ]);
    if (!isOpen || !product) return null;
    const handleSubmit = ()=>{
        const numericQty = Number(qty);
        if (!qty || isNaN(numericQty) || numericQty <= 0) return alert("La cantidad debe ser mayor a 0.");
        if (numericQty > product.stock) return alert("No hay suficiente stock disponible.");
        if (!to) return alert("Selecciona una bodega destino.");
        if (from === to) return alert("La bodega destino debe ser diferente a la origen.");
        onSubmit({
            productId: product.productId || product.id,
            qty: numericQty,
            from,
            to,
            fromBranchId,
            toBranchId
        });
        onClose();
    };
    const handleToChange = (e)=>{
        const selectedName = e.target.value;
        setTo(selectedName);
        const branch = branches.find((b)=>b.name === selectedName);
        setToBranchId(branch?.id || "");
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/40 flex items-center justify-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white rounded-xl p-5 w-[380px] space-y-4 shadow-xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-lg font-semibold text-slate-800",
                    children: "Traslado de inventario"
                }, void 0, false, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 60,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm text-slate-600",
                    children: [
                        "Producto: ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-semibold",
                            children: product.name
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 65,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs font-medium text-slate-600",
                            children: "Cantidad a trasladar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "number",
                            value: qty,
                            onChange: (e)=>setQty(e.target.value),
                            className: "w-full border rounded px-3 py-2 text-sm",
                            placeholder: "Ej: 10"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 73,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs font-medium text-slate-600",
                            children: "Bodega origen"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 84,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            type: "text",
                            value: from,
                            readOnly: true,
                            className: "w-full border rounded px-3 py-2 text-sm bg-slate-100"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-1",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                            className: "text-xs font-medium text-slate-600",
                            children: "Bodega destino"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 97,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                            value: to,
                            onChange: handleToChange,
                            className: "w-full border rounded px-3 py-2 text-sm bg-white",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: "",
                                    children: "Seleccionar..."
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                                    lineNumber: 105,
                                    columnNumber: 13
                                }, this),
                                branches.filter((b)=>b.name !== from).map((b)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: b.name,
                                        children: b.name
                                    }, b.id, false, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                                        lineNumber: 107,
                                        columnNumber: 15
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 96,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-2 pt-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "px-3 py-1.5 text-sm bg-slate-200 rounded hover:bg-slate-300",
                            children: "Cancelar"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 116,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSubmit,
                            className: "px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700",
                            children: "Transferir"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                            lineNumber: 122,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
                    lineNumber: 115,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
            lineNumber: 58,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>KardexDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/react-chartjs-2/dist/index.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/chart.js/dist/chart.js [app-ssr] (ecmascript) <locals>");
"use client";
;
;
;
;
__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Chart"].register(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LineElement"], __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["PointElement"], __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["CategoryScale"], __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$chart$2e$js$2f$dist$2f$chart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["LinearScale"]);
function KardexDrawer({ open, onClose, product, orgSlug }) {
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [movements, setMovements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Obtener el ID correcto del producto (según tu BD)
    const productId = product?.product_id ?? product?.productId ?? product?.id;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!open || !productId) return;
        async function loadKardex() {
            setLoading(true);
            try {
                const res = await fetch(`/api/kardex`, {
                    headers: {
                        "x-org-slug": orgSlug,
                        "x-product-id": productId
                    }
                });
                const json = await res.json();
                if (json.success) {
                    setMovements(json.data);
                } else {
                    console.error("KARDEX ERROR:", json.error);
                }
            } catch (err) {
                console.error("Kardex fetch error:", err);
            }
            setLoading(false);
        }
        loadKardex();
    }, [
        open,
        productId,
        orgSlug
    ]);
    // ================================
    // DATOS PARA GRÁFICA
    // ================================
    const chartData = {
        labels: movements.map((m)=>m.created_at ? m.created_at.substring(0, 10) : "Fecha"),
        datasets: [
            {
                label: "Stock",
                borderColor: "#4F46E5",
                borderWidth: 2,
                tension: 0.35,
                pointRadius: 3,
                data: movements.map((m)=>m.running_stock ?? m.qty ?? 0)
            }
        ]
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed top-0 right-0 h-full w-[420px] bg-white border-l shadow-xl transition-transform duration-300 z-50 
      ${open ? "translate-x-0" : "translate-x-full"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b flex items-center justify-between bg-slate-50",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-sm font-semibold",
                                children: "Historial de Movimientos"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                lineNumber: 80,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: product?.name
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                lineNumber: 81,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onClose,
                        className: "text-slate-600 hover:text-black text-lg",
                        children: "✕"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                lineNumber: 78,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 overflow-y-auto h-full pb-10 space-y-4",
                children: [
                    loading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-sm text-slate-500",
                        children: "Cargando..."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 97,
                        columnNumber: 11
                    }, this),
                    !loading && movements.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-center text-sm text-slate-400",
                        children: "No hay movimientos registrados."
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 102,
                        columnNumber: 11
                    }, this),
                    !loading && movements.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white border rounded-lg p-3 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xs font-semibold mb-2 text-slate-700",
                                children: "Evolución del stock"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                lineNumber: 110,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "h-36",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$react$2d$chartjs$2d$2$2f$dist$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Line"], {
                                    data: chartData
                                }, void 0, false, {
                                    fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                    lineNumber: 114,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                lineNumber: 113,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 109,
                        columnNumber: 11
                    }, this),
                    !loading && movements.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: movements.map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 border rounded-lg bg-slate-50 shadow-sm text-[12px]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-semibold text-slate-800",
                                                children: m.movement_type?.toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                                lineNumber: 128,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-slate-500",
                                                children: m.created_at?.substring(0, 10)
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                                lineNumber: 131,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                        lineNumber: 127,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-700 mt-1",
                                        children: [
                                            "Cantidad: ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: m.qty
                                            }, void 0, false, {
                                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                                lineNumber: 137,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                        lineNumber: 136,
                                        columnNumber: 17
                                    }, this),
                                    m.running_stock !== null && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-600 text-[11px]",
                                        children: [
                                            "Stock restante: ",
                                            m.running_stock
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                        lineNumber: 141,
                                        columnNumber: 19
                                    }, this),
                                    m.reference && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-slate-500",
                                        children: [
                                            "Ref: ",
                                            m.reference
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                        lineNumber: 147,
                                        columnNumber: 19
                                    }, this),
                                    m.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "mt-1 text-slate-500",
                                        children: [
                                            "Nota: ",
                                            m.notes
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                        lineNumber: 153,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, m.id, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                                lineNumber: 123,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
                lineNumber: 93,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryScreen
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$hooks$2f$useInventory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/hooks/useInventory.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryFilters$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryFilters.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryGrid$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryGrid.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$ProductFormModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/ProductFormModal.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryEntryModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryEntryModal.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryExitModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryExitModal.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryTransferModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/components/InventoryTransferModal.jsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$kardex$2f$KardexDrawer$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/kardex/KardexDrawer.jsx [app-ssr] (ecmascript)");
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
function InventoryScreen({ orgSlug }) {
    const inv = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$hooks$2f$useInventory$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInventory"])(orgSlug);
    /* ============ KARDEX DRAWER ============ */ const [kardexOpen, setKardexOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [kardexProduct, setKardexProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openKardex = (product)=>{
        setKardexProduct(product);
        setKardexOpen(true);
    };
    /* ============ ENTRADA ============ */ const [entryOpen, setEntryOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [entryProduct, setEntryProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openEntry = (product)=>{
        setEntryProduct(product);
        setEntryOpen(true);
    };
    const handleEntrySubmit = async (data)=>{
        try {
            const res = await fetch("/api/inventory/movements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-org-slug": orgSlug
                },
                body: JSON.stringify({
                    productId: entryProduct.product_id ?? entryProduct.productId,
                    branchId: entryProduct.branchId,
                    type: "entrada",
                    qty: data.qty,
                    cost: data.cost,
                    price: entryProduct.price,
                    expiresAt: data.expiresAt,
                    lot: data.lot,
                    notes: data.note || "Entrada manual"
                })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                return;
            }
            await inv.loadInventory();
            setEntryOpen(false);
        } catch (err) {
            alert("Error registrando entrada");
        }
    };
    /* ============ SALIDA ============ */ const [exitOpen, setExitOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [exitProduct, setExitProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openExit = (product)=>{
        setExitProduct(product);
        setExitOpen(true);
    };
    const handleExitSubmit = async (data)=>{
        try {
            const res = await fetch("/api/inventory/movements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-org-slug": orgSlug
                },
                body: JSON.stringify({
                    productId: exitProduct.product_id ?? exitProduct.productId,
                    branchId: exitProduct.branchId,
                    type: "salida",
                    qty: data.qty,
                    notes: data.note || "Salida manual"
                })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                return;
            }
            await inv.loadInventory();
            setExitOpen(false);
        } catch (err) {
            alert("Error registrando salida");
        }
    };
    /* ============ TRASLADO ============ */ const [transferOpen, setTransferOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [transferProduct, setTransferProduct] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const openTransfer = (product)=>{
        setTransferProduct(product);
        setTransferOpen(true);
    };
    const handleTransferSubmit = async ({ productId, qty, fromBranchId, toBranchId })=>{
        try {
            const res = await fetch("/api/inventory/movements", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-org-slug": orgSlug
                },
                body: JSON.stringify({
                    productId,
                    type: "transferencia",
                    qty,
                    from_branch: fromBranchId,
                    to_branch: toBranchId,
                    notes: "Traslado entre sucursales"
                })
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error);
                return;
            }
            await inv.loadInventory();
            setTransferOpen(false);
        } catch (err) {
            alert("Error registrando traslado");
        }
    };
    /* ============ UI ============ */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-5 max-w-6xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-lg font-semibold",
                                children: "Inventario"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                                lineNumber: 160,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-500",
                                children: "Control por producto, movimientos y sucursales."
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: inv.openNewProduct,
                        className: "px-3 py-2 bg-slate-900 text-white rounded-lg text-xs",
                        children: "+ Agregar producto"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                        lineNumber: 166,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 158,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white border rounded-xl shadow-sm overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 border-b",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "font-semibold text-sm",
                                children: "Detalle de inventario"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                                lineNumber: 176,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-[11px] text-slate-500",
                                children: [
                                    "Total filtrados: ",
                                    inv.filteredProducts.length
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                                lineNumber: 177,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3 border-b",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryFilters$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            search: inv.search,
                            setSearch: inv.setSearch,
                            category: inv.category,
                            setCategory: inv.setCategory,
                            branch: inv.branch,
                            setBranch: inv.setBranch,
                            lowStockOnly: inv.lowStockOnly,
                            setLowStockOnly: inv.setLowStockOnly
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                            lineNumber: 183,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-4 py-3",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryGrid$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                            products: inv.filteredProducts,
                            stats: inv.stats,
                            onEdit: inv.openEditProduct,
                            onDelete: inv.deleteProduct,
                            onEntry: openEntry,
                            onExit: openExit,
                            onTransfer: openTransfer,
                            onKardex: openKardex,
                            orgSlug: orgSlug
                        }, void 0, false, {
                            fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                            lineNumber: 196,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                        lineNumber: 195,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$kardex$2f$KardexDrawer$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: kardexOpen,
                onClose: ()=>setKardexOpen(false),
                product: kardexProduct,
                orgSlug: orgSlug
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 211,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$ProductFormModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: inv.isModalOpen,
                onClose: inv.closeModal,
                onSave: inv.saveProduct,
                product: inv.editingProduct,
                categories: [
                    "Alimentos",
                    "Medicinas",
                    "Accesorios",
                    "Herramientas",
                    "Otros"
                ],
                branches: inv.branches
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 219,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryEntryModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: entryOpen,
                onClose: ()=>setEntryOpen(false),
                product: entryProduct,
                onSubmit: handleEntrySubmit
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryExitModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: exitOpen,
                onClose: ()=>setExitOpen(false),
                product: exitProduct,
                onSubmit: handleExitSubmit
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$components$2f$InventoryTransferModal$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: transferOpen,
                onClose: ()=>setTransferOpen(false),
                product: transferProduct,
                onSubmit: handleTransferSubmit,
                branches: inv.branches
            }, void 0, false, {
                fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
                lineNumber: 242,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx",
        lineNumber: 156,
        columnNumber: 5
    }, this);
}
}),
"[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/inventory/page.jsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InventoryPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$inventoryScreen$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/proyectos coding/agro-erp-production-2/src/modules/inventory/inventoryScreen.jsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function InventoryPage({ params }) {
    const { orgSlug } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["use"])(params);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$proyectos__coding$2f$agro$2d$erp$2d$production$2d$2$2f$src$2f$modules$2f$inventory$2f$inventoryScreen$2e$jsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        orgSlug: orgSlug
    }, void 0, false, {
        fileName: "[project]/Desktop/proyectos coding/agro-erp-production-2/app/[orgSlug]/inventory/page.jsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
}),
];

//# sourceMappingURL=Desktop_proyectos%20coding_agro-erp-production-2_5cab1c09._.js.map