import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase client for use in API routes and Server Components.
 * Uses the user's session via cookies for RLS.
 * 
 * Usage: In API routes (app/api/...) and Server Components
 * Example: const supabase = await createServerSupabaseClient();
 * 
 * IMPORTANT: This function is async in Next.js 16+ because cookies() is async.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - can be ignored if middleware refreshes sessions
          }
        },
      },
    }
  );
}

/**
 * Service Role client - bypasses RLS.
 * ONLY use in trusted server-side code (API routes) for admin operations.
 * 
 * WARNING: This client has full database access. Never expose to client.
 */
export const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Aliases for backwards compatibility
export const createClient = createServerSupabaseClient;
export const supabase = supabaseAdmin;