"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsers } from "../hooks/useUsers";

const ROLES = [
  { value: "admin", label: "Administrador" },
  { value: "manager", label: "Gerente" },
  { value: "cashier", label: "Cajero" },
  { value: "warehouse", label: "Bodeguero" },
];

export default function UsersTab({ orgSlug }) {
  const { users, loading, error, saving, loadUsers, createUser, updateUser, deleteUser } = useUsers(orgSlug);
  
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ email: "", full_name: "", password: "", role: "cashier", is_active: true });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.full_name.trim()) {
      alert("El nombre y correo son requeridos");
      return;
    }
    
    if (!editingUser && !form.password) {
      alert("La contraseña es requerida para nuevos usuarios");
      return;
    }
    
    if (!editingUser && form.password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, { 
        email: form.email, 
        full_name: form.full_name, 
        role: form.role, 
        is_active: form.is_active 
      });
    } else {
      result = await createUser(form);
    }

    if (result.success) {
      setShowForm(false);
      setEditingUser(null);
      setForm({ email: "", full_name: "", password: "", role: "cashier", is_active: true });
      if (result.message) {
        alert(result.message);
      }
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({
      email: user.email || "",
      full_name: user.full_name || "",
      password: "",
      role: user.role || "cashier",
      is_active: user.is_active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (!confirm(`Estas seguro de eliminar al usuario "${user.full_name}"?`)) return;
    const result = await deleteUser(user.id);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    setForm({ email: "", full_name: "", password: "", role: "cashier", is_active: true });
    setShowPassword(false);
  };

  const getRoleLabel = (role) => {
    const found = ROLES.find(r => r.value === role);
    return found ? found.label : role;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Administracion de Usuarios</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">Gestiona los usuarios que tienen acceso al sistema.</p>

        {!showForm && <Button onClick={() => setShowForm(true)}>Agregar usuario</Button>}

        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 bg-slate-50 space-y-4">
            <h4 className="font-medium text-slate-800">{editingUser ? "Editar Usuario" : "Nuevo Usuario"}</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label>Nombre completo *</Label>
                <Input placeholder="Ej: Juan Perez" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
              </div>
              <div className="flex flex-col space-y-2">
                <Label>Correo electronico *</Label>
                <Input type="email" placeholder="Ej: juan@empresa.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>

            {!editingUser && (
              <div className="flex flex-col space-y-2">
                <Label>Contraseña *</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Minimo 6 caracteres" 
                    value={form.password} 
                    onChange={(e) => setForm({ ...form, password: e.target.value })} 
                    required 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-sm"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <p className="text-xs text-slate-500">El usuario usara esta contraseña para iniciar sesion</p>
              </div>
            )}

            <div className="flex flex-col space-y-2">
              <Label>Rol</Label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="border rounded-md p-2 bg-white">
                {ROLES.map((role) => (<option key={role.value} value={role.value}>{role.label}</option>))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="user-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 rounded border-gray-300" />
              <Label htmlFor="user-active">Usuario activo</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">{saving ? "Guardando..." : (editingUser ? "Actualizar" : "Crear Usuario")}</Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">Cancelar</Button>
            </div>
          </form>
        )}

        <div className="mt-6">
          {loading && <p className="text-slate-500 text-sm">Cargando usuarios...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && users.length === 0 && (
            <div className="border p-4 rounded text-center"><p className="text-slate-500 text-sm">No hay usuarios registrados</p></div>
          )}

          {!loading && users.length > 0 && (
            <>
              {/* Mobile view - cards */}
              <div className="sm:hidden space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-800">{user.full_name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                        <p className="text-xs text-slate-400 mt-1">{getRoleLabel(user.role)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {user.is_active !== false ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex gap-3 pt-2 border-t">
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline text-sm">Editar</button>
                      <button onClick={() => handleDelete(user)} className="text-red-600 hover:underline text-sm">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop view - table */}
              <div className="hidden sm:block border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b">
                    <tr>
                      <th className="text-left p-3 font-medium text-slate-600">Nombre</th>
                      <th className="text-left p-3 font-medium text-slate-600">Correo</th>
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
                        <td className="p-3 text-slate-600">{getRoleLabel(user.role)}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${user.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {user.is_active !== false ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => handleEdit(user)} className="text-blue-600 hover:underline text-xs">Editar</button>
                            <button onClick={() => handleDelete(user)} className="text-red-600 hover:underline text-xs">Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}