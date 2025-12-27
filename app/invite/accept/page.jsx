"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/src/lib/supabase/browser";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!token) {
        setStatus("error");
        setMessage("Token de invitación no válido");
        return;
      }

      if (!user) {
        setStatus("login_required");
        return;
      }

      // Intentar aceptar la invitación
      try {
        const res = await fetch("/api/org/invitations/accept", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error);
          return;
        }

        setStatus("success");
        setMessage(data.message);
        
        // Redirigir al dashboard de la organización
        setTimeout(() => {
          router.push(`/${data.organization.slug}`);
        }, 2000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    checkAuth();
  }, [token, router]);

  const handleLogin = () => {
    router.push(`/login?redirect=/invite/accept?token=${token}`);
  };

  const handleRegister = () => {
    router.push(`/register?redirect=/invite/accept?token=${token}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Procesando invitación...</p>
          </>
        )}

        {status === "login_required" && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Inicia sesión para continuar</h2>
            <p className="text-slate-600 mb-6">Debes iniciar sesión o registrarte para aceptar esta invitación</p>
            <div className="flex gap-3">
              <button onClick={handleLogin} className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                Iniciar Sesión
              </button>
              <button onClick={handleRegister} className="flex-1 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">
                Registrarse
              </button>
            </div>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invitación Aceptada</h2>
            <p className="text-slate-600">{message}</p>
            <p className="text-sm text-slate-400 mt-4">Redirigiendo...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Error</h2>
            <p className="text-slate-600">{message}</p>
            <button onClick={() => router.push("/")} className="mt-6 px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">
              Ir al inicio
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
