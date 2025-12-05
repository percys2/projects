"use client";

import { useState, useEffect } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsScreen({ orgSlug }) {
  const [companyName, setCompanyName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("NIO");

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "", is_active: true });
  const [savingBranch, setSavingBranch] = useState(false);

  const loadBranches = async () => {
    if (!orgSlug) return;
    setBranchesLoading(true);
    setBranchesError(null);
    try {
      const res = await fetch("/api/branches", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar sucursales");
      setBranches(data.branches || []);
    } catch (err) {
      setBranchesError(err.message);
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, [orgSlug]);

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    if (!branchForm.name.trim()) {
      alert("El nombre de la sucursal es requerido");
      return;
    }

    setSavingBranch(true);
    try {
      const method = editingBranch ? "PUT" : "POST";
      const body = editingBranch 
        ? { id: editingBranch.id, ...branchForm }
        : branchForm;

      const res = await fetch("/api/branches", {
        method,
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar sucursal");

      setShowBranchForm(false);
      setEditingBranch(null);
      setBranchForm({ name: "", address: "", phone: "", is_active: true });
      loadBranches();
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingBranch(false);
    }
  };

  const handleEditBranch = (branch) => {
    setEditingBranch(branch);
    setBranchForm({
      name: branch.name || "",
      address: branch.address || "",
      phone: branch.phone || "",
      is_active: branch.is_active !== false,
    });
    setShowBranchForm(true);
  };

  const handleDeleteBranch = async (branch) => {
    if (!confirm(`¿Estás seguro de eliminar la sucursal "${branch.name}"?`)) return;

    try {
      const res = await fetch("/api/branches", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: branch.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar sucursal");

      loadBranches();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelBranchForm = () => {
    setShowBranchForm(false);
    setEditingBranch(null);
    setBranchForm({ name: "", address: "", phone: "", is_active: true });
  };

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

              {!showBranchForm && (
                <Button onClick={() => setShowBranchForm(true)}>Agregar sucursal</Button>
              )}

              {showBranchForm && (
                <form onSubmit={handleBranchSubmit} className="border rounded-lg p-4 mb-6 bg-slate-50 space-y-4">
                  <h4 className="font-medium text-slate-800">
                    {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Nombre *</Label>
                      <Input
                        placeholder="Ej: Sucursal Central"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label>Teléfono</Label>
                      <Input
                        placeholder="Ej: +505 8888 8888"
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Dirección</Label>
                    <Input
                      placeholder="Ej: Km 5 Carretera Norte"
                      value={branchForm.address}
                      onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="branch-active"
                      checked={branchForm.is_active}
                      onChange={(e) => setBranchForm({ ...branchForm, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="branch-active">Sucursal activa</Label>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={savingBranch}>
                      {savingBranch ? "Guardando..." : (editingBranch ? "Actualizar" : "Crear Sucursal")}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelBranchForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-6">
                {branchesLoading && (
                  <p className="text-slate-500 text-sm">Cargando sucursales...</p>
                )}

                {branchesError && (
                  <p className="text-red-500 text-sm">{branchesError}</p>
                )}

                {!branchesLoading && !branchesError && branches.length === 0 && (
                  <div className="border p-4 rounded text-center">
                    <p className="text-slate-500 text-sm">No hay sucursales registradas</p>
                  </div>
                )}

                {!branchesLoading && branches.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
                          <th className="text-left p-3 font-medium text-slate-600">Dirección</th>
                          <th className="text-left p-3 font-medium text-slate-600">Teléfono</th>
                          <th className="text-center p-3 font-medium text-slate-600">Estado</th>
                          <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {branches.map((branch) => (
                          <tr key={branch.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{branch.name}</td>
                            <td className="p-3 text-slate-600">{branch.address || "-"}</td>
                            <td className="p-3 text-slate-600">{branch.phone || "-"}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${branch.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {branch.is_active !== false ? "Activa" : "Inactiva"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditBranch(branch)}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteBranch(branch)}
                                  className="text-red-600 hover:underline text-xs"
                                >
                                  Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
