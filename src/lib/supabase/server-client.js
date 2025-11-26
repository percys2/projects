import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

export function createClient() {
  const cookieStore = cookies();
  const headerStore = headers();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
      headers: {
        get(name) {
          return headerStore.get(name);
        }
      }
    }
  );
}
