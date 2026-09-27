import type { ReactNode } from "react";

export default function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="admin-page-header">
      <div className="admin-page-header-copy">
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="admin-page-title">{title}</h1>
        <p className="admin-page-description">{description}</p>
      </div>
      {actions && <div className="admin-page-actions">{actions}</div>}
    </header>
  );
}
