import { createBrowserClient } from '@supabase/ssr'

export function createBrowserSupabase() {
  console.log('Supabase URL (browser):', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Supabase ANON (first 10 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 10))
  
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
