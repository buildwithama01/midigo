"use client";

export default function AdminToggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-toggle-row">
      <span>{label}</span>
      <input
        checked={checked}
        className="admin-toggle-input"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span aria-hidden="true" className="admin-toggle-control" />
    </label>
  );
}
