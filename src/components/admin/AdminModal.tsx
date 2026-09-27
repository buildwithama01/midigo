"use client";

import { useEffect, type ReactNode } from "react";
import AdminButton from "./AdminButton";

export default function AdminModal({
  children,
  confirmLabel = "Confirm",
  danger = false,
  onClose,
  onConfirm,
  open,
  title,
}: {
  children: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section
        aria-labelledby="admin-modal-title"
        aria-modal="true"
        className="admin-modal"
        role="dialog"
      >
        <div className="admin-modal-heading">
          <h2 id="admin-modal-title">{title}</h2>
          <button
            aria-label="Close dialog"
            className="admin-modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        <div className="admin-modal-actions">
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton onClick={onConfirm} variant={danger ? "danger" : "primary"}>
            {confirmLabel}
          </AdminButton>
        </div>
      </section>
    </div>
  );
}
