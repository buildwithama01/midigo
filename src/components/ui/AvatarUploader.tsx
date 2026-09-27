"use client";

import { useRef, useEffect, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { uploadAvatarAction } from "@/app/admin/actions/uploadAvatar";
import { useFileUpload } from "@/hooks/useFileUpload";
import { getPublicUrlBrowser } from "@/lib/supabase/browserStorage";
import type { UploadAvatarState } from "@/app/admin/actions/uploadAvatar";

interface AvatarUploaderProps {
  currentAvatarUrl: string | null;
  currentName: string;
  size?: number;
  onUploadSuccess?: (url: string) => void;
  showLabel?: boolean;
}

export default function AvatarUploader({
  currentAvatarUrl,
  currentName,
  size = 96,
  onUploadSuccess,
  showLabel = true,
}: AvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  const { upload, loading, error } = useFileUpload<UploadAvatarState>(
    uploadAvatarAction,
    {
      onSuccess: (result) => {
        if (result.success && result.url) {
          onUploadSuccess?.(result.url);
        }
      },
    },
  );

  useEffect(() => {
    if (currentAvatarUrl && currentAvatarUrl.startsWith("http")) {
      setResolvedUrl(currentAvatarUrl);
    } else if (currentAvatarUrl) {
      setResolvedUrl(getPublicUrlBrowser("avatars", currentAvatarUrl));
    } else {
      setResolvedUrl(null);
    }
  }, [currentAvatarUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    upload(formData);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const initials = (currentName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="avatar-uploader">
      <div
        className="avatar-uploader-preview"
        style={{ width: size, height: size }}
      >
        {resolvedUrl ? (
          <img src={resolvedUrl ?? ""} alt={`Avatar for ${currentName}`} />
        ) : (
          <div
            className="avatar-uploader-initials"
            style={{
              fontSize: size * 0.4,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      <button
        type="button"
        className="avatar-uploader-trigger"
        onClick={handleClick}
        disabled={loading}
        aria-label={showLabel ? "Change profile photo" : "Change profile photo"}
      >
        <IoCloudUploadOutline aria-hidden="true" size={16} />
        {showLabel && <span>Change photo</span>}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        disabled={loading}
        style={{ display: "none" }}
      />

      {loading && <span className="avatar-uploader-status">Uploading…</span>}

      {error && (
        <span
          className="avatar-uploader-status"
          style={{ color: "var(--danger-text)" }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
