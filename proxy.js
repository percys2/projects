import { NextResponse } from "next/server";
import { createMiddlewareSupabaseClient } from "@/src/lib/supabase/middleware";

export async function proxy(request) {
  const response = NextResponse.next();

  const supabase = createMiddlewareSupabaseClient(request, response);

  const { data: { user } } = await supabase.auth.getUser();

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];

  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return response;
  }

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};