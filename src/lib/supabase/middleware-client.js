import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export function createClient(request, response) {
  const supabase = createMiddlewareClient({ req: request, res: response });
  return supabase;
}
