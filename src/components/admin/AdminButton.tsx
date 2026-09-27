import type { ButtonHTMLAttributes } from "react";

export type AdminButtonVariant = "primary" | "secondary" | "danger";

export default function AdminButton({
  children,
  variant = "secondary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant;
}) {
  return (
    <button
      className={`admin-button admin-button-${variant} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}
