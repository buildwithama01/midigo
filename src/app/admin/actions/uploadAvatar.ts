"use server";

import { uploadAvatar } from "@/lib/supabase/storage";
import { createClient } from "@/lib/supabase/server";

export interface UploadAvatarState {
  success: boolean;
  url?: string;
  error?: string;
}

export async function uploadAvatarAction(
  prevState: unknown,
  formData: FormData,
): Promise<UploadAvatarState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { success: false, error: "You must be signed in to upload an avatar." };
  }

  const file = formData.get("file") as File;

  if (!file || file.size === 0) {
    return { success: false, error: "No file selected." };
  }

  const result = await uploadAvatar(user.id, file);

  if (!result.success || !result.path) {
    return { success: false, error: result.error ?? "Upload failed." };
  }

  // Save the avatar_url path to the user's profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: result.path })
    .eq("id", user.id);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  return {
    success: true,
    url: result.publicUrl ?? result.path,
  };
}
