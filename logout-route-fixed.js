import { createServerSupabaseClient } from '@/src/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Use cookie-aware client to properly clear the session
    const supabase = await createServerSupabaseClient()
    await supabase.auth.signOut()
    
    // Create response and clear auth cookies manually as backup
    const response = NextResponse.json({ success: true })
    
    // Clear Supabase auth cookies
    response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
    response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })
    
    // Clear any cookies that start with sb- (Supabase pattern)
    const cookieNames = [
      'sb-xekxaazhbebwuuxirtcv-auth-token',
      'sb-xekxaazhbebwuuxirtcv-auth-token.0',
      'sb-xekxaazhbebwuuxirtcv-auth-token.1',
    ]
    cookieNames.forEach(name => {
      response.cookies.set(name, '', { maxAge: 0, path: '/' })
    })
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 })
  }
}
