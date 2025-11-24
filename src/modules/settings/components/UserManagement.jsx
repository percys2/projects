import React, { useState } from "react";

export default function UserManagement({ users, onAdd, onUpdate, onDelete }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    full_name: "",
    role: "user",
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    onAdd(newUser);
    setNewUser({ email: "", full_name: "", role: "user" });
    setShowAddForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Gestión de Usuarios</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
        >
          {showAddForm ? "Cancelar" : "+ Agregar Usuario"}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-slate-50 p-4 rounded mb-4">
          <form onSubmit={handleAddUser} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                placeholder="Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rol</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              >
                <option value="admin">Administrador</option>
                <option value="manager">Gerente</option>
                <option value="user">Usuario</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded text-sm hover:bg-slate-800"
            >
              Agregar Usuario
            </button>
          </form>
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No hay usuarios registrados
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-xs text-slate-600">
                <th className="pb-2 font-medium">Nombre</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Rol</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 text-sm font-medium">{user.full_name}</td>
                  <td className="py-3 text-sm">{user.email}</td>
                  <td className="py-3 text-sm">
                    <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                      {user.role === "admin" ? "Administrador" : user.role === "manager" ? "Gerente" : "Usuario"}
                    </span>
                  </td>
                  <td className="py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Activo
                    </span>
                  </td>
                  <td className="py-3 text-sm text-right">
                    <button
                      onClick={() => onDelete(user.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
