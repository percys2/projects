import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function POST(req) {
  const { email, password } = await req.json();

  // Crear cliente supabase para SSR
  const supabase = createServerClient(
    process.env.SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // NO SERVICE ROLE
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          req.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Hacer login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Responder y dejar cookies de sesión
  return NextResponse.json(
    {
      user: data.user,
      message: "Login exitoso",
    },
    { status: 200 }
  );
}
