"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type ProfilesInsert = Database["public"]["Tables"]["profiles"]["Insert"];
type ProfilesUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * Server Action: upsert a profile with **self-service-safe** fields only.
 *
 * Security: the `role`, `membership`, and `status` columns are privileged.
 * Any values provided for them in `values` are silently ignored. Admins
 * must use `updateProfileAdminAction` to change those fields.
 */
export async function upsertProfileAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // Only non-privileged columns may be set via self-service.
  const safeName = values.Name || null;
  const safeEmail = values.Email || user.email || "unknown@midigo.example";

  if (!values.id) {
    const insertData: ProfilesInsert = {
      id: user.id,
      email: safeEmail,
      name: safeName,
    };

    const { error } = await supabase.from("profiles").insert(insertData);
    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    // Only update the current user's own profile.
    if (values.id !== user.id) {
      return { success: false, error: "You can only update your own profile." };
    }

    const updateData: ProfilesUpdate = {};
    if (values.Name !== undefined) updateData.name = safeName;

    const { error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}

type ProfileRole = NonNullable<
  NonNullable<Database["public"]["Tables"]["profiles"]["Row"]>["role"]
>;

/**
 * Mapping tables for admin-only profile field values.
 */
const roleMap: Record<string, ProfileRole> = {
  Fan: "fan",
  Chatter: "chatter",
  Moderator: "moderator",
  Editor: "editor",
  Administrator: "administrator",
  fan: "fan",
  chatter: "chatter",
  moderator: "moderator",
  editor: "editor",
  administrator: "administrator",
};

const membershipMap: Record<string, Database["public"]["Tables"]["profiles"]["Row"]["membership"]> =
  {
    Free: "free",
    Standard: "standard",
    VIP: "vip",
    Lifetime: "lifetime",
    Founding: "founding",
    free: "free",
    standard: "standard",
    vip: "vip",
    lifetime: "lifetime",
    founding: "founding",
  };

const statusMap: Record<string, Database["public"]["Tables"]["profiles"]["Row"]["status"]> =
  {
    Active: "active",
    Pending: "pending",
    Suspended: "suspended",
    active: "active",
    pending: "pending",
    suspended: "suspended",
  };

/**
 * Server Action: upsert a profile with **privileged** fields (role, membership, status).
 *
 * Security: the caller must be an authenticated administrator. The server
 * verifies the caller's own profile role before allowing any write.
 */
export async function updateProfileAdminAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated." };
  }

  // Authorize: only administrators may modify privileged profile fields.
  const { data: callerProfile, error: callerError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerError || !callerProfile) {
    return { success: false, error: "Could not verify caller role." };
  }

  if (callerProfile.role !== "administrator") {
    return { success: false, error: "Insufficient privileges." };
  }

  const roleValue = values.Role
    ? roleMap[values.Role] ?? "fan"
    : undefined;
  const membershipValue = values.Membership
    ? membershipMap[values.Membership] ?? "free"
    : undefined;
  const statusValue = values.Status
    ? statusMap[values.Status] ?? "pending"
    : undefined;

  if (!values.id) {
    return { success: false, error: "Profile id is required." };
  }

  const updateData: ProfilesUpdate = {};

  if (values.Name !== undefined) updateData.name = values.Name || null;
  if (values.Email !== undefined) updateData.email = values.Email;
  if (values.Role !== undefined) updateData.role = roleValue;
  if (values.Membership !== undefined) updateData.membership = membershipValue;
  if (values.Status !== undefined) updateData.status = statusValue;

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", values.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
