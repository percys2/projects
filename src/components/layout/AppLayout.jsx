"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Boxes,
  ClipboardList,
  ShoppingCart,
  TrendingUp,
  Receipt,
  Wallet,
  Users2,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import NotificationCenter from "@/src/components/notifications/NotificationCenter";

const menuItems = [
  {
    section: "General",
    items: [
      { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, module: "dashboard" },
    ],
  },
  {
    section: "Operaciones",
    items: [
      { key: "inventory", label: "Inventario", icon: Boxes, module: "inventory" },
      { key: "kardex", label: "Kardex", icon: ClipboardList, module: "kardex" },
      { key: "pos", label: "Punto de Venta", icon: ShoppingCart, module: "pos" },
      { key: "sales", label: "Ventas", icon: Receipt, module: "sales" },
    ],
  },
  {
    section: "Clínica",
    items: [
      { key: "odontology", label: "Odontología", icon: Sparkles, module: "odontology" },
    ],
  },
  {
    section: "Comercial",
    items: [
      { key: "crm", label: "CRM Ventas", icon: TrendingUp, module: "crm" },
    ],
  },
  {
    section: "Administracion",
    items: [
      { key: "finance", label: "Finanzas", icon: Wallet, module: "finance" },
      { key: "hr", label: "RRHH", icon: Users2, module: "hr" },
      { key: "settings", label: "Configuracion", icon: Settings, module: "settings" },
    ],
  },
];

const ROLE_MODULES = {
  admin: ["dashboard", "inventory", "kardex", "pos", "sales", "odontology", "crm", "finance", "hr", "settings"],
  manager: ["dashboard", "inventory", "kardex", "pos", "sales", "odontology", "crm", "finance", "hr", "settings"],
  accountant: ["dashboard", "inventory", "odontology", "finance", "hr", "settings"],
  cajero: ["inventory", "pos", "sales", "odontology"],
  cashier: ["inventory", "pos", "sales", "odontology"],
  seller: ["inventory", "pos", "sales", "odontology"],
  warehouse: ["dashboard", "inventory", "kardex"],
  viewer: ["dashboard", "inventory", "sales", "odontology"],
};

export default function AppLayout({ children, orgSlug }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("admin");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (orgSlug) {
      fetch("/api/auth/me", { headers: { "x-org-slug": orgSlug } })
        .then(res => res.json())
        .then(data => {
          if (data.role) setUserRole(data.role);
          if (data.user?.user_metadata?.full_name) setUserName(data.user.user_metadata.full_name);
          else if (data.user?.email) setUserName(data.user.email.split("@")[0]);
        })
        .catch(() => setUserRole("admin"));
    }
  }, [orgSlug]);

  if (!orgSlug) return <main>{children}</main>;

  const activeKey = pathname.split("/")[2] || "dashboard";
  const allowedModules = ROLE_MODULES[userRole] || ROLE_MODULES.admin;

  const filteredMenuItems = menuItems.map(group => ({
    ...group,
    items: group.items.filter(item => !item.module || allowedModules.includes(item.module))
  })).filter(group => group.items.length > 0);

  const goTo = (key) => {
    router.push(`/${orgSlug}/${key}`);
    setIsSidebarOpen(false);
  };

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
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black md:hidden">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg overflow-hidden">
            <Image src="/assets/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-sm font-bold text-white">{orgSlug}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-white">
            <NotificationCenter orgSlug={orgSlug} />
          </div>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-black to-gray-900 text-gray-100 flex flex-col border-r border-gray-800/50 shadow-xl
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="px-4 py-5 border-b border-gray-800/50 overflow-visible">
          <div className="flex items-center justify-between overflow-visible">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center">
                <Image src="/assets/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide text-white">{orgSlug}</h1>
                <p className="text-[11px] text-gray-400">Gestión para clínicas odontológicas</p>
              </div>
            </div>
            <div className="hidden md:block">
              <NotificationCenter orgSlug={orgSlug} />
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {filteredMenuItems.map((group) => (
            <div key={group.section}>
              <p className="px-3 mb-2 text-[10px] font-semibold tracking-[0.15em] uppercase text-gray-500">
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
                          ? "bg-gradient-to-r from-gray-700/50 to-gray-700/20 text-white shadow-sm"
                          : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-lg" />
                      )}
                      <span className={`
                        inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200
                        ${isActive
                          ? "bg-gray-700 text-white shadow-inner"
                          : "bg-gray-800/50 text-gray-500 group-hover:bg-gray-700/50 group-hover:text-gray-300"
                        }
                      `}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {isActive && <span className="h-2 w-2 rounded-full bg-white shadow-lg" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800/50 bg-black/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-3 rounded-lg bg-gray-800/30">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xs font-bold text-gray-300 uppercase shadow-inner">
              {userName?.slice(0, 2) || orgSlug?.slice(0, 2) || "AC"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                {userRole === "cashier" || userRole === "cajero" || userRole === "seller" ? "Cajero" : userRole === "admin" ? "Admin" : userRole}
              </p>
              <p className="text-sm font-medium text-gray-200 truncate">{userName || orgSlug}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
              text-sm font-medium text-red-400 
              bg-red-500/5 border border-red-500/20
              hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-300
              transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Cerrar sesion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 pt-16 md:pt-6">{children}</main>
    </div>
  );
}