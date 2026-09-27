"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ChatterUpdate = Database["public"]["Tables"]["chatters"]["Update"];

/**
 * Server Action: create or update a chatter record.
 *
 * When creating, the admin can pick a user from the dropdown. We resolve
 * the profile name to a profiles.id and set chatters.profile_id accordingly,
 * so that the chatter workspace can join chatters→conversations correctly.
 */
export async function upsertChatterAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const presenceMap: Record<string, string> = {
    online: "online",
    away: "away",
    offline: "offline",
  };

  const statusMap: Record<string, string> = {
    available: "available",
    busy: "busy",
    offline: "offline",
  };

  // When a profile name is selected, resolve it to a profile id.
  let profileId: string | null = null;
  if (values.Profile || values.Chatter) {
    const chatterName = values.Chatter || values.Profile;
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("name", chatterName)
      .maybeSingle();

    if (profileData?.id) {
      profileId = profileData.id;
    }
  }

  if (!values.id) {
    const { error } = await supabase.from("chatters").insert({
      profile_id: profileId,
      name: values.Chatter || values.Profile || "Unknown",
      queue: values.Queue || "General",
      presence: (presenceMap[values.Presence] || "offline") as "online" | "away" | "offline",
      active_conversations: values.Conversations
        ? parseInt(values.Conversations, 10) || 0
        : 0,
      avg_response_time: values["Response time"] || null,
      status: (statusMap[values.Status] || "offline") as "available" | "busy" | "offline",
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const updateData: ChatterUpdate = {
      name: values.Chatter || values.Profile || "Unknown",
      queue: values.Queue,
      presence: (presenceMap[values.Presence] || "offline") as "online" | "away" | "offline",
      active_conversations: values.Conversations
        ? parseInt(values.Conversations, 10) || 0
        : 0,
      avg_response_time: values["Response time"] || null,
      status: (statusMap[values.Status] || "offline") as "available" | "busy" | "offline",
    };

    if (profileId) {
      updateData.profile_id = profileId;
    }

    const { error } = await supabase
      .from("chatters")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
