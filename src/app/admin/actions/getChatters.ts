"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: fetch all chatter records joined with their profile.
 * Used to populate the "Assigned to" dropdown in the admin messages dialog.
 */
export async function getChattersAction(): Promise<
  { id: string; name: string; queue: string }[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chatters")
    .select("id, name, queue")
    .order("name");

  if (error || !data) {
    return [];
  }

  return data;
}
