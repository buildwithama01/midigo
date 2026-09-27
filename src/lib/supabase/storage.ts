import { createClient as createServerClient } from "./server";
import { isSupabaseConfigured } from "./config";

export interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const AVATAR_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MEDIA_ALLOWED_TYPES = [
  "image/*",
  "video/*",
  "audio/*",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MEDIA_MAX_SIZE = 50 * 1024 * 1024; // 50 MB

function validateFile(
  file: File,
  maxSize: number,
  allowedTypes: string[],
): string | null {
  if (file.size > maxSize) {
    return `File is too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`;
  }

  const isAllowed = allowedTypes.some((type) => {
    if (type.endsWith("/*")) {
      return file.type.startsWith(type.slice(0, -2));
    }
    return file.type === type;
  });

  if (!isAllowed) {
    return "File type is not allowed.";
  }

  return null;
}

/**
 * Upload a profile avatar to the `avatars` storage bucket.
 * Returns the storage path that should be stored in `profiles.avatar_url`.
 * Uses the server-side client (requires authentication cookies).
 */
export async function uploadAvatar(
  userId: string,
  file: File,
): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  const validationError = validateFile(
    file,
    AVATAR_MAX_SIZE,
    AVATAR_ALLOWED_TYPES,
  );
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createServerClient();
  const path = `avatars/${userId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error } = await supabase.storage.from("avatars").upload(path, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  return {
    success: true,
    path,
    publicUrl: urlData?.publicUrl,
  };
}

/**
 * Upload a media asset to the `media` storage bucket.
 * Returns the storage path to be stored in `media_assets.storage_path`.
 * Uses the server-side client (requires authentication cookies).
 */
export async function uploadMedia(file: File): Promise<UploadResult> {
  if (!isSupabaseConfigured()) {
    return { success: false, error: "Supabase is not configured." };
  }

  const validationError = validateFile(
    file,
    MEDIA_MAX_SIZE,
    MEDIA_ALLOWED_TYPES,
  );
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = await createServerClient();

  const category = file.type.startsWith("image/")
    ? "images"
    : file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("audio/")
        ? "audio"
        : "documents";

  const path = `media/${category}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error } = await supabase.storage.from("media").upload(path, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(path);

  return {
    success: true,
    path,
    publicUrl: urlData?.publicUrl,
  };
}

/**
 * Get the public URL for a file in a given bucket (browser-safe, sync).
 * Uses the browser client — no async/await needed.
 */
export function getPublicUrlBrowser(
  bucket: "avatars" | "media",
  path: string,
): string | null {
  if (!path || typeof window === "undefined" || !isSupabaseConfigured()) return null;

  // Lazy import to avoid bundling server code in the browser
  const { createClient } = require("./client");
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}

/**
 * Get the public URL for a file in a given bucket (server-safe, async).
 * Uses the server context client — preserves auth cookies.
 */
export async function getPublicUrl(
  bucket: "avatars" | "media",
  path: string,
): Promise<string | null> {
  if (!path) return null;

  const supabase = await createServerClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl ?? null;
}
