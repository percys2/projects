import { NextResponse } from "next/server";
import { createSupabaseEdgeClient } from "@/src/lib/supabase/edge-client";

export async function proxy(request) {
  const response = NextResponse.next();

  const supabase = createSupabaseEdgeClient(request, response);

  const { data: { user } } = await supabase.auth.getUser();

  const publicRoutes = ["/", "/login", "/register"];

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
