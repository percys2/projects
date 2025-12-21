"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralTab from "./tabs/GeneralTab";
import CompanyTab from "./tabs/CompanyTab";
import BranchesTab from "./tabs/BranchesTab";
import UsersTab from "./tabs/UsersTab";
import PermissionsTab from "./tabs/PermissionsTab";
import InvoicingTab from "./tabs/InvoicingTab";

export default function SettingsScreen({ orgSlug }) {
  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Configuracion</h1>
        <p className="text-slate-600 text-sm sm:text-base mt-1">
          Ajustes generales del ERP, administracion de sucursales, usuarios y mas.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap gap-1 sm:grid sm:grid-cols-6 w-full h-auto">
          <TabsTrigger value="general" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            General
          </TabsTrigger>
          <TabsTrigger value="empresa" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Empresa
          </TabsTrigger>
          <TabsTrigger value="sucursales" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Sucursales
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="permisos" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Permisos
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="flex-1 min-w-[80px] text-xs sm:text-sm">
            Facturacion
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralTab orgSlug={orgSlug} />
          </TabsContent>

          <TabsContent value="empresa">
            <CompanyTab orgSlug={orgSlug} />
          </TabsContent>

          <TabsContent value="sucursales">
            <BranchesTab orgSlug={orgSlug} />
          </TabsContent>

          <TabsContent value="usuarios">
            <UsersTab orgSlug={orgSlug} />
          </TabsContent>

          <TabsContent value="permisos">
            <PermissionsTab />
          </TabsContent>

          <TabsContent value="facturacion">
            <InvoicingTab orgSlug={orgSlug} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
