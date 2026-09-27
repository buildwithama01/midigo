"use client";

import Image from "next/image";
import { useEffect } from "react";
import { IoCloseOutline, IoLockClosedOutline } from "react-icons/io5";

export type MediaItem = {
  id: string;
  src: string;
  title: string;
  category: string;
  date: string;
  locked?: boolean;
};

export default function MediaLightbox({
  media,
  onClose,
}: {
  media: MediaItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={media.title}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--overlay)",
        backdropFilter: "blur(12px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem",
          borderBottom: "1px solid var(--modal-border)",
        }}
      >
        <div>
          <h3 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--text-primary)" }}>
            {media.title}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
            {media.category} &bull; {media.date}
          </p>
        </div>
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <IoCloseOutline size={20} />
        </button>
      </header>

      {/* Main Image Container */}
      <div style={{ flex: 1, position: "relative", padding: "2rem" }}>
        {media.locked ? (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--purple-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--purple)",
            }}>
              <IoLockClosedOutline size={32} />
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--text-primary)" }}>Premium Content</h2>
            <p style={{ color: "var(--text-secondary)", textAlign: "center", maxWidth: "400px", lineHeight: 1.6 }}>
              This exclusive media is reserved for VIP fans. Upgrade your tier to view full-resolution renders and behind-the-scenes content.
            </p>
            <button className="btn btn-lime">Unlock VIP Access</button>
          </div>
        ) : (
          <Image
            src={media.src}
            alt={media.title}
            fill
            style={{ objectFit: "contain" }}
          />
        )}
      </div>
    </div>
  );
}
