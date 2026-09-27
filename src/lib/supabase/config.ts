export const SUPABASE_SETUP_MESSAGE =
  "Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local with values from your Supabase project.";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !url ||
    !anonKey ||
    url.includes("your-project-url-here") ||
    anonKey.includes("your-anon-key-here")
  ) {
    return false;
  }

  try {
    const parsedUrl = new URL(url);
    return (
      (parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:") &&
      Boolean(parsedUrl.host)
    );
  } catch {
    return false;
  }
}
