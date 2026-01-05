"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SubscriptionSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-emerald-200 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">¡Suscripción Activada!</h1>
            <p className="text-slate-600 mb-8">Tu suscripción ha sido procesada exitosamente.</p>
            <Link href="/dashboard" className="inline-flex items-center justify-center w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Ir al Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
