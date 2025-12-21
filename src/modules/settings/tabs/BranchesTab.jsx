"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBranches } from "../hooks/useBranches";

export default function BranchesTab({ orgSlug }) {
  const { branches, loading, error, saving, loadBranches, createBranch, updateBranch, deleteBranch } = useBranches(orgSlug);
  
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", is_active: true });

  useEffect(() => {
    loadBranches();
  }, [loadBranches]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("El nombre de la sucursal es requerido");
      return;
    }

    let result;
    if (editingBranch) {
      result = await updateBranch(editingBranch.id, form);
    } else {
      result = await createBranch(form);
    }

    if (result.success) {
      setShowForm(false);
      setEditingBranch(null);
      setForm({ name: "", address: "", phone: "", is_active: true });
    } else {
      alert(result.error);
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setForm({
      name: branch.name || "",
      address: branch.address || "",
      phone: branch.phone || "",
      is_active: branch.is_active !== false,
    });
    setShowForm(true);
  };

  const handleDelete = async (branch) => {
    if (!confirm(`Estas seguro de eliminar la sucursal "${branch.name}"?`)) return;
    const result = await deleteBranch(branch.id);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBranch(null);
    setForm({ name: "", address: "", phone: "", is_active: true });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Administracion de Sucursales</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 mb-4">
          Crear, editar o eliminar sucursales para gestionar inventarios.
        </p>

        {!showForm && (
          <Button onClick={() => setShowForm(true)}>Agregar sucursal</Button>
        )}

        {showForm && (
          <form onSubmit={handleSubmit} className="border rounded-lg p-4 mb-6 bg-slate-50 space-y-4">
            <h4 className="font-medium text-slate-800">
              {editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-2">
                <Label>Nombre *</Label>
                <Input
                  placeholder="Ej: Sucursal Diriomo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Label>Telefono</Label>
                <Input
                  placeholder="Ej: +505 8888 8888"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              <Label>Direccion</Label>
              <Input
                placeholder="Ej: Km 5 Carretera Norte"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="branch-active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="branch-active">Sucursal activa</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? "Guardando..." : (editingBranch ? "Actualizar" : "Crear Sucursal")}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
          </form>
        )}

        <div className="mt-6">
          {loading && <p className="text-slate-500 text-sm">Cargando sucursales...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {!loading && !error && branches.length === 0 && (
            <div className="border p-4 rounded text-center">
              <p className="text-slate-500 text-sm">No hay sucursales registradas</p>
              <p className="text-xs text-slate-400 mt-1">Agrega sucursales como Diriomo, Masatepe, Bodega Central</p>
            </div>
          )}

          {!loading && branches.length > 0 && (
            <>
              {/* Mobile view - cards */}
              <div className="sm:hidden space-y-3">
                {branches.map((branch) => (
                  <div key={branch.id} className="border rounded-lg p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-slate-800">{branch.name}</p>
                        <p className="text-sm text-slate-500">{branch.address || "Sin direccion"}</p>
                        {branch.phone && <p className="text-sm text-slate-500">{branch.phone}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${branch.is_active !== false ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {branch.is_active !== false ? "Activa" : "Inactiva"}
                      </span>
                    </div>
                    <div className="flex gap-3 pt-2 border-t">
                      <button onClick={() => handleEdit(branch)} className="text-blue-600 hover:underline text-sm">Editar</button>
                      <button onClick={() => handleDelete(branch)} className="text-red-600 hover:underline text-sm">Eliminar</button>
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
                            <button onClick={() => handleEdit(branch)} className="text-blue-600 hover:underline text-xs">Editar</button>
                            <button onClick={() => handleDelete(branch)} className="text-red-600 hover:underline text-xs">Eliminar</button>
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