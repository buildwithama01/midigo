import { createClient } from "./client";
import { isSupabaseConfigured } from "./config";

export function getPublicUrlBrowser(
  bucket: "avatars" | "media",
  path: string,
): string | null {
  if (!path || !isSupabaseConfigured()) return null;

  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
