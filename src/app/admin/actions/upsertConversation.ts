"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ConversationsInsert = Database["public"]["Tables"]["conversations"]["Insert"];
type ConversationsUpdate = Database["public"]["Tables"]["conversations"]["Update"];

/**
 * Server Action: create or update a conversation.
 *
 * The admin dialog sends the chatter's display name as the "Assignee" value.
 * We look up the chatter record by profile_id (joined from profiles) so that
 * assignee_id references chatters.id — the correct foreign key.
 *
 * If the chatter cannot be found (e.g. the name doesn't match a known chatter),
 * assignee_id is set to null and assignee_name is set to the raw value.
 */
export async function upsertConversationAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  const fanName = values.Fan || "Unknown";
  const subject = values.Subject || "No subject";
  const assigneeName = values.Assignee?.trim() || "";
  const status = (values.Status || "open") as ConversationsInsert["status"];

  let assigneeId: string | null = null;

  // If an assignee name was provided, try to resolve it to a chatter id.
  if (assigneeName) {
    // First try matching by chatter name (from the chatters.name column).
    const { data: chatterByName } = await supabase
      .from("chatters")
      .select("id")
      .eq("name", assigneeName)
      .maybeSingle();

    if (chatterByName?.id) {
      assigneeId = chatterByName.id;
    } else {
      // Fallback: try matching by profile name for a chatter role user.
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("name", assigneeName)
        .eq("role", "chatter")
        .maybeSingle();

      if (profile?.id) {
        const { data: chatterRow } = await supabase
          .from("chatters")
          .select("id")
          .eq("profile_id", profile.id)
          .maybeSingle();

        if (chatterRow?.id) {
          assigneeId = chatterRow.id;
        }
      }

      // If we still don't have a chatter id, check if there's a profile
      // with that name — and if so, find or create a chatter row for them.
      if (!assigneeId) {
        // Look up the profile by name to get profile_id
        const { data: profileByName } = await supabase
          .from("profiles")
          .select("id")
          .eq("name", assigneeName)
          .maybeSingle();

        if (profileByName?.id) {
          // Check if a chatter row already exists for this profile
          const { data: existingChatter } = await supabase
            .from("chatters")
            .select("id")
            .eq("profile_id", profileByName.id)
            .maybeSingle();

          if (existingChatter?.id) {
            assigneeId = existingChatter.id;
          } else {
            // Create a chatter row for this profile
            const { data: newChatter } = await supabase
              .from("chatters")
              .insert({
                profile_id: profileByName.id,
                name: assigneeName,
                queue: "General",
                presence: "offline",
                status: "offline",
              })
              .select("id")
              .single();

            if (newChatter?.id) {
              assigneeId = newChatter.id;
            }
          }
        }
      }
    }
  }

  if (!values.id) {
    // Create
    const insertData: ConversationsInsert = {
      fan_name: fanName,
      subject,
      assignee_id: assigneeId,
      assignee_name: assigneeName || "Unassigned",
      message_count: 0,
      status,
    };

    const { error } = await supabase
      .from("conversations")
      .insert(insertData);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Update
    const updateData: ConversationsUpdate = {};

    if (values.Fan !== undefined) updateData.fan_name = fanName;
    if (values.Subject !== undefined) updateData.subject = subject;
    if (values.Assignee !== undefined) {
      updateData.assignee_id = assigneeId;
      updateData.assignee_name = assigneeName || "Unassigned";
    }
    if (values.Status !== undefined) updateData.status = status;

    const { error } = await supabase
      .from("conversations")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
