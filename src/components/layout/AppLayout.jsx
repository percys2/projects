"use client";

import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventario" },
  { key: "kardex", label: "Kardex" },
  { key: "pos", label: "Punto de Venta" },
  { key: "crm", label: "CRM Ventas" },
  { key: "sales", label: "Ventas" },
  { key: "finance", label: "Finanzas" },
  { key: "hr", label: "RRHH" },
  { key: "settings", label: "Configuración" },
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
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="px-4 py-4 border-b border-slate-700">
          <h1 className="text-xl font-bold">AgroCentro ERP</h1>
          <p className="text-xs text-slate-400">Gestión para agroservicios</p>
        </div>

        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((i) => (
            <button
              key={i.key}
              onClick={() => goTo(i.key)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-800 ${
                activeKey === i.key ? "bg-slate-800 font-semibold" : ""
              }`}
            >
              {i.label}
            </button>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Sucursal: {orgSlug}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-800 px-2 py-1 rounded transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}