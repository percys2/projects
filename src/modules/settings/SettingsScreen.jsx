"use client";

import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"; // shadcn
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsScreen() {
  const [companyName, setCompanyName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("NIO");

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <p className="text-slate-600">
        Ajustes generales del ERP, administración de sucursales, usuarios y más.
      </p>

      {/* TABS */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Ajustes Generales del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

              <div className="flex flex-col space-y-2">
                <Label>Zona horaria</Label>
                <Input
                  placeholder="Ej: America/Managua"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Moneda predeterminada</Label>
                <Input
                  placeholder="Ej: NIO"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
              </div>

              <Button className="mt-4">Guardar configuración</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMPRESA */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la Empresa</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label>Nombre de la empresa</Label>
                <Input
                  placeholder="AgroCentro Nica"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Correo administrativo</Label>
                <Input placeholder="correo@empresa.com" />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Teléfono</Label>
                <Input placeholder="+505 8888 8888" />
              </div>

              <Button className="mt-4">Guardar cambios</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUCURSALES */}
        <TabsContent value="sucursales">
          <Card>
            <CardHeader>
              <CardTitle>Administración de Sucursales</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Crear, editar o eliminar sucursales para gestionar inventarios.
              </p>

              <Button>Agregar sucursal</Button>

              {/* Aquí insertarás un listado de sucursales dinámico */}
              <div className="mt-6 border p-4 rounded">
                <p className="text-slate-500 text-sm">
                  Aquí aparecerá la tabla de sucursales…
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USUARIOS */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Administración de Usuarios</CardTitle>
            </CardHeader>

            <CardContent>
              <Button>Agregar usuario</Button>

              <div className="mt-6 border p-4 rounded">
                <p className="text-slate-500 text-sm">
                  Aquí aparecerá la tabla de usuarios…
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERMISOS */}
        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-slate-600 text-sm mb-3">
                Define qué módulos pueden ver y usar tus empleados.
              </p>

              <Button>Crear nuevo rol</Button>

              <div className="mt-6 border p-4 rounded">
                <p className="text-slate-500 text-sm">
                  Aquí aparecerá la tabla de permisos…
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACTURACIÓN */}
        <TabsContent value="facturacion">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Facturación</CardTitle>
            </CardHeader>

            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Configura tu formato de factura, impuestos y numeración.
              </p>

              <Button>Configurar facturación</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
