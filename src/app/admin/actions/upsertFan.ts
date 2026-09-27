"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type FansInsert = Database["public"]["Tables"]["fans"]["Insert"];
type FansUpdate = Database["public"]["Tables"]["fans"]["Update"];

/**
 * Server Action: create or update a fan record.
 * Maps admin dialog field values to the fans table columns.
 */
export async function upsertFanAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Map display values to db values
  const membershipMap: Record<string, string> = {
    Free: "free",
    Standard: "standard",
    VIP: "vip",
    Lifetime: "lifetime",
  };

  const engagementMap: Record<string, string> = {
    Low: "low",
    Medium: "medium",
    High: "high",
    "Very high": "very_high",
  };

  const statusMap: Record<string, string> = {
    Active: "active",
    VIP: "vip",
    "At risk": "at_risk",
    Churned: "churned",
  };

  if (!values.id) {
    const insertData: FansInsert = {
      name: values.Fan || "Unknown",
      handle: values.Handle || "",
      membership: membershipMap[values.Membership] || values.Membership || "free",
      engagement: (engagementMap[values.Engagement] || "medium") as FansInsert["engagement"],
      status: (statusMap[values.Status] || "active") as FansInsert["status"],
    };

    const { error } = await supabase.from("fans").insert(insertData);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const updateData: FansUpdate = {};

    if (values.Fan !== undefined) updateData.name = values.Fan;
    if (values.Handle !== undefined) updateData.handle = values.Handle;
    if (values.Membership !== undefined) updateData.membership = membershipMap[values.Membership] || values.Membership;
    if (values.Engagement !== undefined) updateData.engagement = (engagementMap[values.Engagement] || "medium") as FansUpdate["engagement"];
    if (values.Status !== undefined) updateData.status = (statusMap[values.Status] || "active") as FansUpdate["status"];

    const { error } = await supabase
      .from("fans")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
