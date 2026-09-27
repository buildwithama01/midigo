import type { ReactNode } from "react";

export default function ChatterPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="chatter-page-header">
      <div className="chatter-page-header-copy">
        {eyebrow && <p className="label label-purple">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="chatter-page-header-actions">{actions}</div>}
    </header>
  );
}
