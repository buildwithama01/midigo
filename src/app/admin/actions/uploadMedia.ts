"use server";

import { uploadMedia } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

export interface UploadMediaState {
  success: boolean;
  mediaId?: string;
  error?: string;
}

export async function uploadMediaAction(
  prevState: unknown,
  formData: FormData,
): Promise<UploadMediaState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { success: false, error: "You must be signed in to upload media." };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  const result = await uploadMedia(file);

  if (!result.success || !result.path) {
    return { success: false, error: result.error ?? "Upload failed." };
  }

  // Create a media_assets row with the storage path
  const title = formData.get("title") as string;
  const category = (formData.get("category") as string) || "Uncategorized";
  const visibility = ((formData.get("visibility") as string) || "public") as "public" | "members" | "vip";

  const { data: inserted, error: insertError } = await supabase
    .from("media_assets")
    .insert({
      title: title || file.name,
      category,
      storage_path: result.path,
      visibility,
      status: "published",
      uploaded_by: user.id,
    })
    .select("id")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  return {
    success: true,
    mediaId: inserted?.id,
  };
}
