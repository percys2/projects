"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Wallet,
  Users2,
  Settings,
  LogOut,
  Store,
} from "lucide-react";

const menuItems = [
  {
    section: "General",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Operaciones",
    items: [
      { key: "inventory", label: "Inventario", icon: Boxes },
      { key: "kardex", label: "Kardex", icon: ClipboardList },
      { key: "pos", label: "Punto de Venta", icon: ShoppingCart },
      { key: "sales", label: "Ventas", icon: Receipt },
    ],
  },
  {
    section: "Comercial",
    items: [
      { key: "crm", label: "CRM Ventas", icon: TrendingUp },
    ],
  },
  {
    section: "Administración",
    items: [
      { key: "finance", label: "Finanzas", icon: Wallet },
      { key: "hr", label: "RRHH", icon: Users2 },
      { key: "settings", label: "Configuración", icon: Settings },
    ],
  },
];

export default function AppLayout({ children, orgSlug }) {
  const router = useRouter();
  const pathname = usePathname();

  if (!orgSlug) return <main>{children}</main>;

  const activeKey = pathname.split("/")[2] || "dashboard";

  const goTo = (key) => router.push(`/${orgSlug}/${key}`);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100 flex flex-col border-r border-slate-800/50 shadow-xl">
        {/* Brand Header */}
        <div className="px-4 py-5 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Store className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white">
                AgroCentro ERP
              </h1>
              <p className="text-[11px] text-slate-400">
                Gestión para agroservicios
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {menuItems.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-slate-500">
                {group.section}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeKey === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => goTo(item.key)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-out group relative
                        ${isActive
                          ? "bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 shadow-sm"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                        }
                      `}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-emerald-400 rounded-r-full shadow-lg shadow-emerald-400/50" />
                      )}
                      
                      {/* Icon container */}
                      <span
                        className={`
                          inline-flex h-8 w-8 items-center justify-center rounded-lg
                          transition-all duration-200
                          ${isActive
                            ? "bg-emerald-500/20 text-emerald-300 shadow-inner"
                            : "bg-slate-800/50 text-slate-500 group-hover:bg-slate-700/50 group-hover:text-slate-300"
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      
                      {/* Label */}
                      <span className="flex-1 text-left truncate">
                        {item.label}
                      </span>
                      
                      {/* Active dot indicator */}
                      {isActive && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-800/50 bg-slate-950/50">
          {/* Branch info */}
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-slate-800/30">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 uppercase shadow-inner">
              {orgSlug?.slice(0, 2) || "AC"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Sucursal
              </p>
              <p className="text-sm font-medium text-slate-200 truncate">
                {orgSlug}
              </p>
            </div>
          </div>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
              text-sm font-medium text-red-400 
              bg-red-500/5 border border-red-500/20
              hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300
              transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 bg-slate-50">{children}</main>
    </div>
  );
}