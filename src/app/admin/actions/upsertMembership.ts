"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Server Action: create or update a membership record.
 */
export async function upsertMembershipAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const statusMap: Record<string, string> = {
    active: "active",
    past_due: "past_due",
    cancelled: "cancelled",
    refunded: "refunded",
  };

  // Parse amount from "$29.99" format
  const parseAmount = (amount: string | undefined): number => {
    if (!amount) return 0;
    const numeric = parseFloat(amount.replace(/[^0-9.]/g, ""));
    return isNaN(numeric) ? 0 : Math.round(numeric * 100);
  };

  if (!values.id) {
    const { error } = await supabase.from("memberships").insert({
      member_name: values.Member || "Unknown",
      plan: values.Plan || "Free",
      amount_cents: parseAmount(values.Amount),
      status: (statusMap[values.Status.toLowerCase()] || "active") as "active" | "past_due" | "cancelled" | "refunded",
      renewal_at: values.Renewal ? new Date().toISOString() : null,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabase
      .from("memberships")
      .update({
        member_name: values.Member,
        plan: values.Plan,
        amount_cents: parseAmount(values.Amount),
        status: (statusMap[values.Status.toLowerCase()] || "active") as "active" | "past_due" | "cancelled" | "refunded",
        renewal_at: values.Renewal ? new Date().toISOString() : null,
      })
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
