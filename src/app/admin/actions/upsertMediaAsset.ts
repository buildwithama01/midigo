"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type MediaAssetsUpdate = Database["public"]["Tables"]["media_assets"]["Update"];

/**
 * Server Action: update a media asset record.
 * Handles dialog edits and row action status changes.
 */
export async function upsertMediaAssetAction(
  values: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const visibilityMap: Record<string, string> = {
    public: "public",
    members: "members",
    vip: "vip",
  };

  const statusMap: Record<string, string> = {
    draft: "draft",
    published: "published",
    locked: "locked",
  };

  if (!values.id) {
    // Create — only via upload flow (which already inserts),
    // but handle gracefully if called from a dialog
    const { error } = await supabase.from("media_assets").insert({
      title: values.Asset || "Untitled",
      category: values.Category || "Other",
      visibility: (visibilityMap[values.Visibility?.toLowerCase()] || "public") as MediaAssetsUpdate["visibility"],
      status: (statusMap[values.Status?.toLowerCase()] || "published") as MediaAssetsUpdate["status"],
      uploaded_by: user?.id ?? null,
    });

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const updateData: MediaAssetsUpdate = {};

    if (values.Asset !== undefined) updateData.title = values.Asset;
    if (values.Category !== undefined) updateData.category = values.Category;
    if (values.Visibility !== undefined) updateData.visibility = (visibilityMap[values.Visibility?.toLowerCase()] || "public") as MediaAssetsUpdate["visibility"];
    if (values.Status !== undefined) updateData.status = (statusMap[values.Status?.toLowerCase()] || "published") as MediaAssetsUpdate["status"];

    const { error } = await supabase
      .from("media_assets")
      .update(updateData)
      .eq("id", values.id);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  return { success: true };
}
