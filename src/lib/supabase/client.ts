import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { isSupabaseConfigured, SUPABASE_SETUP_MESSAGE } from "./config";

/**
 * Browser-side Supabase client.
 * Use this in Client Components ("use client").
 *
 * @example
 * const supabase = createClient();
 * const { data } = await supabase.from("profiles").select("*");
 */
export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(SUPABASE_SETUP_MESSAGE);
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
