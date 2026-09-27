import type { ReactNode } from "react";

export default function AdminIconAction({
  ariaLabel,
  children,
  onClick,
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button aria-label={ariaLabel} className="admin-icon-action" onClick={onClick} type="button">
      {children}
    </button>
  );
}
