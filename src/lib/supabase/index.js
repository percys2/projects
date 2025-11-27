/**
 * Supabase Client Exports
 * 
 * USE THE RIGHT CLIENT FOR YOUR CONTEXT:
 * 
 * 1. Browser/Client Components ("use client"):
 *    import { createBrowserSupabaseClient } from "@/src/lib/supabase";
 * 
 * 2. API Routes & Server Components:
 *    import { createServerSupabaseClient } from "@/src/lib/supabase";
 *    const supabase = await createServerSupabaseClient(); // Note: async!
 * 
 * 3. Admin operations (bypass RLS):
 *    import { supabaseAdmin } from "@/src/lib/supabase";
 * 
 * 4. Middleware/Edge:
 *    import { createMiddlewareSupabaseClient } from "@/src/lib/supabase";
 */

export { createBrowserSupabaseClient, createClient as createBrowserClient } from "./browser";
export { createServerSupabaseClient, supabaseAdmin, supabase } from "./server";
export { createMiddlewareSupabaseClient, createSupabaseEdgeClient } from "./middleware";