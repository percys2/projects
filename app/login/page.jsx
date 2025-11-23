"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/src/lib/supabase/supabase-browser";

export default function LoginPage() {
  const supabase = createBrowserSupabase();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Buscar organización
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organizations(slug)")
        .eq("user_id", data.user.id)
        .single();

      router.push(`/${membership.organizations.slug}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto min-h-screen flex items-center">
      <form onSubmit={handleLogin} className="w-full space-y-4">
        <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>

        {error && <p className="text-red-600 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Correo electrónico"
          className="border p-2 w-full rounded"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border p-2 w-full rounded"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full bg-indigo-600 text-white p-2 rounded"
          disabled={loading}
        >
          {loading ? "Entrando..." : "Iniciar Sesión"}
        </button>

        <p className="text-center text-sm">
          <a className="text-indigo-600" href="/register">Crear cuenta</a>
        </p>
      </form>
    </div>
  );
}
