import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./database.types";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "./config";

/**
 * Server-side Supabase client.
 * Use this in Server Components, Route Handlers, and Server Actions.
 *
 * @example
 * const supabase = await createClient();
 * const { data } = await supabase.from("profiles").select("*");
 */
export async function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method is called from a Server Component.
            // Cookies can only be set from Server Actions or Route Handlers.
            // Ignored here — the middleware will handle session refresh.
          }
        },
      },
    },
  );
}
