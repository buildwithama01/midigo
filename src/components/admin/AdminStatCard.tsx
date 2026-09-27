import type { ReactNode } from "react";

export type AdminStatTone = "default" | "accent" | "info" | "warning" | "danger";

export default function AdminStatCard({
  label,
  value,
  detail,
  tone = "default",
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  tone?: AdminStatTone;
  icon: ReactNode;
}) {
  return (
    <article className="admin-stat-card">
      <div className={`admin-stat-icon admin-stat-icon-${tone}`}>
        <span aria-hidden="true">{icon}</span>
      </div>
      <div>
        <span className="admin-stat-label">{label}</span>
        <strong className="admin-stat-value">{value}</strong>
        <p className="admin-stat-detail">{detail}</p>
      </div>
    </article>
  );
}
