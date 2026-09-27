import type { ReactNode } from "react";

export type AdminBadgeTone =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

export default function AdminBadge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: AdminBadgeTone;
}) {
  return <span className={`admin-badge admin-badge-${tone}`}>{children}</span>;
}
