import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Rutas públicas sin protección
  const publicRoutes = ["/", "/login", "/register"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Crear respuesta y Supabase Server Client
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Obtener usuario logueado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si NO hay usuario → redirigir a login
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Extraer slug de URL → /masatepe/dashboard
  const parts = pathname.split("/").filter(Boolean);
  const orgSlug = parts[0];

  // Si no hay slug, continuar
  if (!orgSlug) return response;

  // Validar que el usuario es miembro de esa organización
  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id, organizations(slug)")
    .eq("user_id", user.id)
    .eq("organizations.slug", orgSlug)
    .single();

  // Si no pertenece → volver a login
  if (!membership) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

// Matcher limpio, sin regex prohibidos
export const config = {
  matcher: [
    "/((?!_next|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)",
  ],
};
