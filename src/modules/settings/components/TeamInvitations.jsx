"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserPlus, Mail, Clock, Trash2, Copy, Check } from "lucide-react";

export default function TeamInvitations({ orgSlug }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/org/invitations", {
        headers: { "x-org-slug": orgSlug },
      });
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      }
    } catch (err) {
      console.error("Error loading invitations:", err);
    } finally {
      setLoading(false);
    }
  }, [orgSlug]);

  useEffect(() => {
    loadInvitations();
  }, [loadInvitations]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSending(true);
      const res = await fetch("/api/org/invitations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-slug": orgSlug,
        },
        body: JSON.stringify({ email: email.trim(), role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      setEmail("");
      loadInvitations();
    } catch (err) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Cancelar esta invitación?")) return;

    try {
      const res = await fetch(`/api/org/invitations?id=${id}`, {
        method: "DELETE",
        headers: { "x-org-slug": orgSlug },
      });
      if (!res.ok) throw new Error("Error al cancelar");
      loadInvitations();
    } catch (err) {
      alert(err.message);
    }
  };

  const copyLink = async (token) => {
    const link = `${window.location.origin}/invite/accept?token=${token}`;
    await navigator.clipboard.writeText(link);
    setCopiedId(token);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-NI", {
      timeZone: "America/Managua",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const roles = [
    { value: "member", label: "Miembro" },
    { value: "admin", label: "Administrador" },
    { value: "viewer", label: "Solo lectura" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">Invitar Usuarios</h3>
        <p className="text-xs text-slate-500">Invita a otros usuarios a tu organización</p>
      </div>

      {/* Invite Form */}
      <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            className="w-full px-4 py-2 border rounded-lg text-sm"
            required
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 border rounded-lg text-sm"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          {sending ? "Enviando..." : "Invitar"}
        </button>
      </form>

      {/* Pending Invitations */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 border-b">
          <h4 className="text-sm font-semibold text-slate-700">
            Invitaciones Pendientes ({invitations.length})
          </h4>
        </div>

        {loading ? (
          <div className="p-4 text-center text-slate-400">Cargando...</div>
        ) : invitations.length === 0 ? (
          <div className="p-4 text-center text-slate-400">
            No hay invitaciones pendientes
          </div>
        ) : (
          <div className="divide-y">
            {invitations.map((inv) => (
              <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{inv.email}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="capitalize">{inv.role}</span>
                      <span>-</span>
                      <Clock className="w-3 h-3" />
                      <span>Expira: {formatDate(inv.expires_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => copyLink(inv.token)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Copiar link"
                  >
                    {copiedId === inv.token ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    title="Cancelar invitación"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-700 mb-2">Cómo funciona</h4>
        <ol className="text-xs text-blue-600 space-y-1 list-decimal list-inside">
          <li>Ingresa el email del usuario que quieres invitar</li>
          <li>Selecciona el rol (Miembro, Admin, o Solo lectura)</li>
          <li>Copia el link de invitación y envíalo al usuario</li>
          <li>El usuario debe registrarse/iniciar sesión con ese email</li>
          <li>Al aceptar, se unirá automáticamente a tu organización</li>
        </ol>
      </div>
    </div>
  );
}