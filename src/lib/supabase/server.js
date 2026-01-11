import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getRequiredEnv(name) {
  const value = process.env[name];
  return value && value.trim() ? value : null;
}

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
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL") || "",
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY") || "",
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
const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const _supabaseAdmin =
  supabaseUrl && serviceRoleKey
    ? createSupabaseClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// Avoid failing `next build` when env vars are not set; fail only when actually used.
export const supabaseAdmin =
  _supabaseAdmin ??
  new Proxy(
    {},
    {
      get() {
        throw new Error(
          "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        );
      },
    }
  );

// Aliases for backwards compatibility
export const createClient = createServerSupabaseClient;
export const supabase = supabaseAdmin;