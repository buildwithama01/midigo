"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action that fetches the current authenticated user's role and status
 * from the profiles table.
 *
 * Returns { role, status } or null if the user is not authenticated
 * or the profile cannot be found.
 */
export async function getUserRoleAction(): Promise<{
  role: string;
  status: string;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (error || !profile) return null;

  return {
    role: profile.role,
    status: profile.status,
  };
}
