"use client";

import { useRouter, usePathname } from "next/navigation";

const menuItems = [
  { key: "dashboard", label: "Dashboard" },
  { key: "inventory", label: "Inventario" },
  { key: "pos", label: "Punto de Venta" },
  { key: "clients", label: "Clientes / CRM" },
  { key: "delivery", label: "Reparto" },
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

        <div className="px-4 py-3 border-t text-xs text-slate-400">
          <p>Sucursal: {orgSlug}</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-4">{children}</main>
    </div>
  );
}
