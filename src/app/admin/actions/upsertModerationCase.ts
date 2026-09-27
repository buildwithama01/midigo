"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ModerationCasesInsert = Database["public"]["Tables"]["moderation_cases"]["Insert"];
type ModerationCasesUpdate = Database["public"]["Tables"]["moderation_cases"]["Update"];

/**
 * Server Action: create or update a moderation case.
 */
export async function upsertModerationCaseAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const severityMap: Record<string, string> = {
    low: "low",
    medium: "medium",
    high: "high",
  };

  const statusMap: Record<string, string> = {
    open: "open",
    in_review: "in_review",
    resolved: "resolved",
  };

  if (!values.id) {
    const insertData: ModerationCasesInsert = {
      target: values.Target || "Unknown",
      reason: values.Reason || "Other",
      severity: (severityMap[values.Severity?.toLowerCase()] || "medium") as ModerationCasesInsert["severity"],
      status: (statusMap[values.Status?.toLowerCase()] || "open") as ModerationCasesInsert["status"],
      reporter: values.Reporter || "System",
    };

    const { error } = await supabase.from("moderation_cases").insert(insertData);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const updateData: ModerationCasesUpdate = {};

    if (values.Target !== undefined) updateData.target = values.Target;
    if (values.Reason !== undefined) updateData.reason = values.Reason;
    if (values.Severity !== undefined) updateData.severity = (severityMap[values.Severity?.toLowerCase()] || "medium") as ModerationCasesUpdate["severity"];
    if (values.Status !== undefined) updateData.status = (statusMap[values.Status?.toLowerCase()] || "open") as ModerationCasesUpdate["status"];
    if (values.Reporter !== undefined) updateData.reporter = values.Reporter;

    const { error } = await supabase
      .from("moderation_cases")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
