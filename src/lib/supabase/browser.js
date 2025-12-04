import { createBrowserClient } from "@supabase/ssr";

let browserClient = null;

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses singleton pattern to avoid creating multiple clients.
 * 
 * Usage: In "use client" components
 * Example: const supabase = createBrowserSupabaseClient();
 */
export function createBrowserSupabaseClient() {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return browserClient;
}

// Alias for backwards compatibility
export const createClient = createBrowserSupabaseClient;