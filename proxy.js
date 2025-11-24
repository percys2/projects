import { createClient } from '@/src/lib/supabase/middleware-client'
import { NextResponse } from 'next/server'

export async function proxy(request) {  // ← CHANGED: middleware → proxy
  const { pathname } = request.nextUrl
  // ... rest of the code stays the same
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/api/auth/register', '/api/auth/logout']
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Create Supabase client and get response
  const { supabase, response: supabaseResponse } = createClient(request)

  // Get user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Extract orgSlug from URL (e.g., /acme/dashboard -> acme)
  const pathParts = pathname.split('/').filter(Boolean)
  const orgSlug = pathParts[0]

  if (!orgSlug) {
    return NextResponse.next()
  }

  // Get user's organization membership
  const { data: membership, error: membershipError } = await supabase
    .from('organization_members')
    .select('org_id, role, organizations(id, slug)')
    .eq('user_id', user.id)
    .eq('organizations.slug', orgSlug)
    .single()

  if (membershipError || !membership) {
    // User doesn't belong to this organization
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    return NextResponse.redirect(redirectUrl)
  }

  // Clone the response and add tenant context headers
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Set tenant context headers for API routes
  response.headers.set('x-org-id', membership.org_id)
  response.headers.set('x-org-slug', orgSlug)
  response.headers.set('x-user-id', user.id)
  response.headers.set('x-user-role', membership.role)

  // Copy cookies from supabaseResponse
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
