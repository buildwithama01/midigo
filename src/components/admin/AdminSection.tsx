import type { ReactNode } from "react";

export default function AdminSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="admin-panel">
      <header className="admin-panel-heading">
        <div>
          {description && <span className="admin-label">{description}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </header>
      <div className="admin-panel-body">{children}</div>
    </section>
  );
}
