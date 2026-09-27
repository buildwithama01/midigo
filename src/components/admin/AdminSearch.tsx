"use client";

import { IoSearchOutline } from "react-icons/io5";

export default function AdminSearch({
  ariaLabel,
  onChange,
  placeholder,
  value,
}: {
  ariaLabel: string;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <label className="admin-search">
      <IoSearchOutline aria-hidden="true" size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
      <input
        aria-label={ariaLabel}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}
