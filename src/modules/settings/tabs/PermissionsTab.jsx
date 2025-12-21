"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PERMISSIONS_MATRIX = [
  { module: "POS", admin: true, manager: true, cashier: true, warehouse: false },
  { module: "Inventario", admin: true, manager: true, cashier: false, warehouse: true },
  { module: "Reportes", admin: true, manager: true, cashier: false, warehouse: false },
  { module: "Configuracion", admin: true, manager: false, cashier: false, warehouse: false },
  { module: "Usuarios", admin: true, manager: false, cashier: false, warehouse: false },
  { module: "Sucursales", admin: true, manager: true, cashier: false, warehouse: false },
];

export default function PermissionsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Matriz de Permisos por Rol</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">Vista de los permisos asignados a cada rol del sistema.</p>

        {/* Mobile view - cards */}
        <div className="sm:hidden space-y-4">
          {PERMISSIONS_MATRIX.map((perm) => (
            <div key={perm.module} className="border rounded-lg p-4 bg-white">
              <h4 className="font-medium text-slate-800 mb-3">{perm.module}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${perm.admin ? "bg-green-500" : "bg-red-400"}`}></span>
                  <span className="text-slate-600">Admin</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${perm.manager ? "bg-green-500" : "bg-red-400"}`}></span>
                  <span className="text-slate-600">Gerente</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${perm.cashier ? "bg-green-500" : "bg-red-400"}`}></span>
                  <span className="text-slate-600">Cajero</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${perm.warehouse ? "bg-green-500" : "bg-red-400"}`}></span>
                  <span className="text-slate-600">Bodeguero</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop view - table */}
        <div className="hidden sm:block border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">Modulo</th>
                <th className="text-center p-3 font-medium text-slate-600">Admin</th>
                <th className="text-center p-3 font-medium text-slate-600">Gerente</th>
                <th className="text-center p-3 font-medium text-slate-600">Cajero</th>
                <th className="text-center p-3 font-medium text-slate-600">Bodeguero</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_MATRIX.map((perm) => (
                <tr key={perm.module} className="border-b hover:bg-slate-50">
                  <td className="p-3 font-medium">{perm.module}</td>
                  <td className="p-3 text-center"><span className={`inline-block w-3 h-3 rounded-full ${perm.admin ? "bg-green-500" : "bg-red-400"}`}></span></td>
                  <td className="p-3 text-center"><span className={`inline-block w-3 h-3 rounded-full ${perm.manager ? "bg-green-500" : "bg-red-400"}`}></span></td>
                  <td className="p-3 text-center"><span className={`inline-block w-3 h-3 rounded-full ${perm.cashier ? "bg-green-500" : "bg-red-400"}`}></span></td>
                  <td className="p-3 text-center"><span className={`inline-block w-3 h-3 rounded-full ${perm.warehouse ? "bg-green-500" : "bg-red-400"}`}></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-500">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span> Acceso permitido
            <span className="inline-block w-2 h-2 rounded-full bg-red-400 ml-4 mr-1"></span> Sin acceso
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
