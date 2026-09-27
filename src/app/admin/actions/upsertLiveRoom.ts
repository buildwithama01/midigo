"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: create or update a live room.
 */
export async function upsertLiveRoomAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const statusMap: Record<string, string> = {
    live: "live",
    upcoming: "upcoming",
    ended: "ended",
  };

  if (!values.id) {
    const { error } = await supabase.from("live_rooms").insert({
      title: values.Room || "Untitled room",
      host: values.Host || "Unknown",
      max_participants: values.Participants
        ? parseInt(values.Participants, 10) || 0
        : 0,
      status: (statusMap[values.Status] || "upcoming") as "live" | "upcoming" | "ended",
      scheduled_at: values.Started ? new Date(values.Started).toISOString() : new Date().toISOString(),
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("live_rooms")
      .update({
        title: values.Room,
        host: values.Host,
        max_participants: values.Participants
          ? parseInt(values.Participants, 10) || 0
          : 0,
        status: (statusMap[values.Status] || "upcoming") as "live" | "upcoming" | "ended",
        started_at:
          values.Status === "live"
            ? new Date().toISOString()
            : values.Started
              ? new Date(values.Started).toISOString()
              : undefined,
      })
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
