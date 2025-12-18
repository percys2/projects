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
import { ROLES, ROLE_LABELS, getPermissionsForRole } from "@/src/lib/auth/rbac";

export default function SettingsScreen({ orgSlug }) {
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [companyPhone, setCompanyPhone] = useState("");
  const [timezone, setTimezone] = useState("");
  const [currency, setCurrency] = useState("NIO");
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingCompany, setSavingCompany] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [branches, setBranches] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [branchesError, setBranchesError] = useState(null);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branchForm, setBranchForm] = useState({ name: "", address: "", phone: "", is_active: true });
  const [savingBranch, setSavingBranch] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ email: "", full_name: "", role: "cashier", is_active: true });
  const [savingUser, setSavingUser] = useState(false);

  // Invoice settings state
  const [invoiceSettings, setInvoiceSettings] = useState({
    prefix: "FAC",
    next_number: 1,
    tax_rate: 15,
    tax_name: "IVA",
    show_tax: true,
    footer_text: "",
    terms: "",
  });
  const [savingInvoice, setSavingInvoice] = useState(false);

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

  const loadUsers = async () => {
    if (!orgSlug) return;
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch("/api/settings/users", {
        headers: { "x-org-slug": orgSlug },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al cargar usuarios");
      setUsers(data.users || []);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!orgSlug) return;
    setLoadingSettings(true);
    try {
      const orgRes = await fetch("/api/settings/organization", {
        headers: { "x-org-slug": orgSlug },
      });
      const orgData = await orgRes.json();
      if (orgRes.ok && orgData.organization) {
        setCompanyName(orgData.organization.name || "");
        setCompanyEmail(orgData.organization.email || "");
        setCompanyPhone(orgData.organization.phone || "");
        setCurrency(orgData.organization.currency || "NIO");
      }

      const prefsRes = await fetch("/api/settings/preferences", {
        headers: { "x-org-slug": orgSlug },
      });
      const prefsData = await prefsRes.json();
      if (prefsRes.ok && prefsData.preferences) {
        setTimezone(prefsData.preferences.timezone || "");
      }
    } catch (err) {
      console.error("Error loading settings:", err);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const res = await fetch("/api/settings/preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ timezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      alert("Configuracion general guardada");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleSaveCompany = async () => {
    setSavingCompany(true);
    try {
      const res = await fetch("/api/settings/organization", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({
          name: companyName,
          email: companyEmail,
          phone: companyPhone,
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      alert("Datos de empresa guardados");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingCompany(false);
    }
  };

  useEffect(() => {
    loadBranches();
    loadUsers();
    loadSettings();
  }, [orgSlug]);

  // User handlers
  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.email.trim() || !userForm.full_name.trim()) {
      alert("El email y nombre son requeridos");
      return;
    }

    setSavingUser(true);
    try {
      const method = editingUser ? "PUT" : "POST";
      const body = editingUser 
        ? { id: editingUser.id, ...userForm }
        : userForm;

      const res = await fetch("/api/settings/users", {
        method,
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar usuario");

      setShowUserForm(false);
      setEditingUser(null);
      setUserForm({ email: "", full_name: "", role: "cashier", is_active: true });
      loadUsers();
      alert(editingUser ? "Usuario actualizado" : "Usuario creado exitosamente");
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingUser(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      email: user.email || "",
      full_name: user.full_name || "",
      role: user.role || "cashier",
      is_active: user.is_active !== false,
    });
    setShowUserForm(true);
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Estas seguro de eliminar al usuario "${user.full_name}"?`)) return;

    try {
      const res = await fetch("/api/settings/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-org-slug": orgSlug },
        body: JSON.stringify({ id: user.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancelUserForm = () => {
    setShowUserForm(false);
    setEditingUser(null);
    setUserForm({ email: "", full_name: "", role: "cashier", is_active: true });
  };

  // Invoice settings handler
  const handleSaveInvoiceSettings = async () => {
    setSavingInvoice(true);
    try {
      const res = await fetch("/api/settings/invoices", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify(invoiceSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      alert("Configuracion de facturacion guardada");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSavingInvoice(false);
    }
  };

  // Get role options for select
  const roleOptions = Object.entries(ROLES).map(([key, value]) => ({
    value,
    label: ROLE_LABELS[value] || key,
  }));

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
    if (!confirm(`Estas seguro de eliminar la sucursal "${branch.name}"?`)) return;

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
      <h1 className="text-3xl font-bold">Configuracion</h1>
      <p className="text-slate-600">
        Ajustes generales del ERP, administracion de sucursales, usuarios y mas.
      </p>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="facturacion">Facturacion</TabsTrigger>
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

              <Button className="mt-4" onClick={handleSaveGeneral} disabled={savingGeneral}>
                {savingGeneral ? "Guardando..." : "Guardar configuracion"}
              </Button>
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
                <Input 
                  placeholder="correo@empresa.com" 
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col space-y-2">
                <Label>Telefono</Label>
                <Input 
                  placeholder="+505 8888 8888" 
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                />
              </div>

              <Button className="mt-4" onClick={handleSaveCompany} disabled={savingCompany}>
                {savingCompany ? "Guardando..." : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SUCURSALES */}
        <TabsContent value="sucursales">
          <Card>
            <CardHeader>
              <CardTitle>Administracion de Sucursales</CardTitle>
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
                      <Label>Telefono</Label>
                      <Input
                        placeholder="Ej: +505 8888 8888"
                        value={branchForm.phone}
                        onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Direccion</Label>
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
                          <th className="text-left p-3 font-medium text-slate-600">Direccion</th>
                          <th className="text-left p-3 font-medium text-slate-600">Telefono</th>
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
              <CardTitle>Administracion de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Gestiona los usuarios que tienen acceso al sistema.
              </p>

              {!showUserForm && (
                <Button onClick={() => setShowUserForm(true)}>Agregar usuario</Button>
              )}

              {showUserForm && (
                <form onSubmit={handleUserSubmit} className="border rounded-lg p-4 mb-6 bg-slate-50 space-y-4">
                  <h4 className="font-medium text-slate-800">
                    {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Nombre completo *</Label>
                      <Input
                        placeholder="Ej: Juan Perez"
                        value={userForm.full_name}
                        onChange={(e) => setUserForm({ ...userForm, full_name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="Ej: juan@empresa.com"
                        value={userForm.email}
                        onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col space-y-2">
                      <Label>Rol</Label>
                      <select
                        value={userForm.role}
                        onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {roleOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                      <input
                        type="checkbox"
                        id="user-active"
                        checked={userForm.is_active}
                        onChange={(e) => setUserForm({ ...userForm, is_active: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="user-active">Usuario activo</Label>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={savingUser}>
                      {savingUser ? "Guardando..." : (editingUser ? "Actualizar" : "Crear Usuario")}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelUserForm}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-6">
                {usersLoading && (
                  <p className="text-slate-500 text-sm">Cargando usuarios...</p>
                )}

                {usersError && (
                  <p className="text-red-500 text-sm">{usersError}</p>
                )}

                {!usersLoading && !usersError && users.length === 0 && (
                  <div className="border p-4 rounded text-center">
                    <p className="text-slate-500 text-sm">No hay usuarios registrados</p>
                  </div>
                )}

                {!usersLoading && users.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
                          <th className="text-left p-3 font-medium text-slate-600">Email</th>
                          <th className="text-left p-3 font-medium text-slate-600">Rol</th>
                          <th className="text-center p-3 font-medium text-slate-600">Estado</th>
                          <th className="text-center p-3 font-medium text-slate-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-slate-50">
                            <td className="p-3 font-medium">{user.full_name}</td>
                            <td className="p-3 text-slate-600">{user.email}</td>
                            <td className="p-3">
                              <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                {ROLE_LABELS[user.role] || user.role}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${user.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {user.is_active !== false ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user)}
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

        {/* PERMISOS */}
        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 text-sm mb-6">
                Estos son los roles predefinidos del sistema y sus permisos. Para cambiar el rol de un usuario, ve a la pestana de Usuarios.
              </p>

              <div className="space-y-6">
                {Object.entries(ROLES).map(([key, role]) => {
                  const permissions = getPermissionsForRole(role);
                  return (
                    <div key={role} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-lg">{ROLE_LABELS[role]}</h4>
                        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                          {permissions.length} permisos
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <span
                            key={perm}
                            className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                          >
                            {perm.replace(/_/g, " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Nota:</strong> Los roles y permisos estan predefinidos en el sistema. 
                  Para personalizar permisos especificos, contacta al administrador del sistema.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FACTURACION */}
        <TabsContent value="facturacion">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Facturacion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-slate-600">
                Configura tu formato de factura, impuestos y numeracion.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Numeracion de Facturas</h4>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Prefijo de factura</Label>
                    <Input
                      placeholder="Ej: FAC"
                      value={invoiceSettings.prefix}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, prefix: e.target.value })}
                    />
                    <p className="text-xs text-slate-500">Ejemplo: FAC-0001</p>
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Proximo numero</Label>
                    <Input
                      type="number"
                      min="1"
                      value={invoiceSettings.next_number}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, next_number: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-slate-800">Impuestos</h4>
                  
                  <div className="flex flex-col space-y-2">
                    <Label>Nombre del impuesto</Label>
                    <Input
                      placeholder="Ej: IVA"
                      value={invoiceSettings.tax_name}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tax_name: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Label>Tasa de impuesto (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceSettings.tax_rate}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, tax_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="show-tax"
                      checked={invoiceSettings.show_tax}
                      onChange={(e) => setInvoiceSettings({ ...invoiceSettings, show_tax: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="show-tax">Mostrar impuesto en facturas</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-slate-800">Texto Adicional</h4>
                
                <div className="flex flex-col space-y-2">
                  <Label>Pie de pagina de factura</Label>
                  <Input
                    placeholder="Ej: Gracias por su compra"
                    value={invoiceSettings.footer_text}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, footer_text: e.target.value })}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Label>Terminos y condiciones</Label>
                  <textarea
                    placeholder="Ej: Los productos no tienen devolucion despues de 30 dias..."
                    value={invoiceSettings.terms}
                    onChange={(e) => setInvoiceSettings({ ...invoiceSettings, terms: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <Button onClick={handleSaveInvoiceSettings} disabled={savingInvoice}>
                {savingInvoice ? "Guardando..." : "Guardar configuracion de facturacion"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
