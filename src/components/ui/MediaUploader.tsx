"use client";

import { useRef, useState } from "react";
import { IoCloudUploadOutline, IoDocumentOutline, IoImageOutline, IoVideocamOutline, IoMusicalNoteOutline } from "react-icons/io5";
import { uploadMediaAction } from "@/app/admin/actions/uploadMedia";
import { useFileUpload } from "@/hooks/useFileUpload";
import type { UploadMediaState } from "@/app/admin/actions/uploadMedia";

interface MediaUploaderProps {
  onUploadSuccess?: () => void;
}

export default function MediaUploader({ onUploadSuccess }: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { upload, loading, error, data } = useFileUpload<UploadMediaState>(
    uploadMediaAction,
    {
      onSuccess: (result) => {
        if (result.success) {
          onUploadSuccess?.();
        }
      },
    },
  );

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [visibility, setVisibility] = useState<"public" | "members" | "vip">("public");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Upload each file with the same metadata (title falls back to filename)
    Array.from(files).forEach((file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title || file.name);
      formData.append("category", category);
      formData.append("visibility", visibility);
      upload(formData);
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(event.target.files);
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  return (
    <div className="media-uploader">
      {/* Metadata form — matches the admin edit dialog fields */}
      <div className="media-uploader-meta" style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1rem",
        marginBottom: "1rem",
      }}>
        <div>
          <label
            htmlFor="media-title"
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "0.25rem",
            }}
          >
            Title
          </label>
          <input
            id="media-title"
            type="text"
            placeholder="e.g. Behind the scenes – Vol. 3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label
            htmlFor="media-category"
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "0.25rem",
            }}
          >
            Category
          </label>
          <select
            id="media-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
            style={{ width: "100%" }}
          >
            {[ "Photos", "Videos", "Audio", "Documents", "Other"].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label
            htmlFor="media-visibility"
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: 500,
              color: "var(--text-secondary)",
              marginBottom: "0.25rem",
            }}
          >
            Visibility tier
          </label>
          <select
            id="media-visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as typeof visibility)}
            className="form-input"
            style={{ width: "100%" }}
          >
            <option value="public">Public</option>
            <option value="members">Members</option>
            <option value="vip">VIP</option>
          </select>
        </div>
      </div>

      {/* Dropzone */}
      <div
        className={`media-uploader-dropzone ${dragOver ? "drag-over" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <div className="media-uploader-content">
          <IoCloudUploadOutline size={32} className="media-uploader-icon" />
          <div>
            <strong>Upload media</strong>
            <p className="media-uploader-text">
              Click to browse or drag a file here
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          disabled={loading}
          multiple
          style={{ display: "none" }}
        />
      </div>

      {loading && (
        <p className="media-uploader-status" style={{ color: "var(--text-secondary)" }}>
          Uploading…
        </p>
      )}

      {error && (
        <p className="media-uploader-status" style={{ color: "var(--danger-text)" }}>
          {error}
        </p>
      )}

      {data?.success && (
        <p className="media-uploader-status" style={{ color: "var(--success-text)" }}>
          Uploaded successfully.
        </p>
      )}
    </div>
  );
}
