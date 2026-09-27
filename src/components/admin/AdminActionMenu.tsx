"use client";

import { useEffect, useRef, useState } from "react";
import AdminButton from "./AdminButton";

export type AdminActionMenuItem = {
  label: string;
  onSelect: () => void;
  danger?: boolean;
};

export default function AdminActionMenu({
  items,
  label = "Actions",
}: {
  items: AdminActionMenuItem[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div className="admin-action-menu" ref={menuRef}>
      <AdminButton
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
      </AdminButton>
      {open && (
        <div className="admin-action-menu-popover" role="menu">
          {items.map((item) => (
            <button
              className={item.danger ? "admin-action-menu-danger" : ""}
              key={item.label}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              role="menuitem"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
