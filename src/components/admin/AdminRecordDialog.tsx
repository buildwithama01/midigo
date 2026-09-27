"use client";

import { useMemo, useState } from "react";
import { IoFolderOutline } from "react-icons/io5";
import AdminButton from "./AdminButton";
import type {
  AdminDialogConfig,
  AdminDialogFieldConfig,
  AdminRecord,
  AdminRecordDialogMode,
} from "./adminTypes";

function FieldInput({
  field,
  value,
  onChange,
  readOnly,
}: {
  field: AdminDialogFieldConfig;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}) {
  const baseClass = "form-input admin-form-input";
  const label = field.label ?? field.key;
  const placeholder = field.placeholder ?? label;
  const required = field.required !== false;

  if (readOnly) {
    return (
      <div key={field.key}>
        <span>{label}</span>
        <strong>{value || "—"}</strong>
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <label className="admin-form-field" key={field.key}>
        <span>{label}</span>
        <select
          className={baseClass}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          value={value}
        >
          <option value="">Select {label.toLowerCase()}…</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="admin-form-field admin-form-field-full" key={field.key}>
        <span>{label}</span>
        <textarea
          className={baseClass}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
          value={value}
        />
      </label>
    );
  }

  if (field.type === "file") {
    return (
      <label className="admin-form-field admin-form-field-full" key={field.key}>
        <span>{label}</span>
        <div className="admin-file-upload">
          <span className="admin-file-upload-icon">
            <IoFolderOutline aria-hidden="true" size={24} />
          </span>
          <span className="admin-file-upload-text">
            {value || `Click to browse or drag a file here`}
          </span>
          <input
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            className="admin-file-input"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onChange(file.name);
            }}
            type="file"
          />
        </div>
      </label>
    );
  }

  return (
    <label className="admin-form-field" key={field.key}>
      <span>{label}</span>
      <input
        className={baseClass}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={field.type ?? "text"}
        value={value}
      />
    </label>
  );
}

export default function AdminRecordDialog({
  columns,
  config,
  mode,
  record,
  onClose,
  onSave,
}: {
  columns: string[];
  config?: AdminDialogConfig;
  mode: AdminRecordDialogMode;
  record?: AdminRecord;
  onClose: () => void;
  onSave: (values: Record<string, string>) => void;
}) {
  // Derive effective fields — use config.fields if provided, else fall back to column names
  const fields: AdminDialogFieldConfig[] = useMemo(() => {
    if (config?.fields && config.fields.length > 0) return config.fields;
    return columns.map((col) => ({ key: col }));
  }, [columns, config]);

  const visibleFields =
    mode === "view"
      ? fields.filter((f) => f.showInView !== false)
      : fields;

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          mode === "view" ? record?.details[field.key] ?? "" : "",
        ]),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fields, mode, record],
  );
  const [values, setValues] = useState(initialValues);

  const updateValue = (key: string, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  // ── Title / label derivation ────────────────────────────────────────────
  const eyebrowLabel =
    mode === "create"
      ? config?.createTitle
        ? undefined
        : "New record"
      : mode === "edit"
        ? config?.editTitle
          ? undefined
          : "Edit record"
        : config?.viewTitle
          ? undefined
          : "Record details";

  const dialogTitle =
    mode === "create"
      ? config?.createTitle ?? "Create record"
      : mode === "edit"
        ? config?.editTitle ?? record?.title ?? "Edit record"
        : config?.viewTitle ?? record?.title ?? "Record";

  const saveLabel =
    mode === "create"
      ? config?.createLabel ?? "Create record"
      : config?.editLabel ?? "Save changes";

  const icon = config?.icon;

  return (
    <div className="admin-modal-backdrop" role="presentation">
      <section
        aria-labelledby="admin-record-dialog-title"
        aria-modal="true"
        className="admin-modal admin-record-dialog"
        role="dialog"
      >
        <div className="admin-modal-heading">
          <div className="admin-modal-heading-copy">
            {icon && (
              <span className="admin-dialog-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <div>
              {eyebrowLabel && (
                <span className="admin-label">{eyebrowLabel}</span>
              )}
              <h2 id="admin-record-dialog-title">{dialogTitle}</h2>
              {mode === "create" && config?.createDescription && (
                <p className="admin-dialog-description">
                  {config.createDescription}
                </p>
              )}
            </div>
          </div>
          <button
            aria-label="Close dialog"
            className="admin-modal-close"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {mode === "view" ? (
          <div className="admin-modal-body admin-record-details">
            {visibleFields.map((field) => (
              <FieldInput
                field={field}
                key={field.key}
                onChange={() => {}}
                readOnly
                value={record?.details[field.key] ?? ""}
              />
            ))}
          </div>
        ) : (
          <form
            id="admin-record-form"
            className="admin-modal-body admin-form-grid"
            onSubmit={(event) => {
              event.preventDefault();
              onSave(values);
            }}
          >
            {visibleFields.map((field) => (
              <FieldInput
                field={field}
                key={field.key}
                onChange={(value) => updateValue(field.key, value)}
                readOnly={false}
                value={values[field.key] ?? ""}
              />
            ))}
          </form>
        )}

        <div className="admin-modal-actions">
          <AdminButton onClick={onClose}>
            {mode === "view" ? "Close" : "Cancel"}
          </AdminButton>
          {mode !== "view" && (
            <AdminButton type="submit" variant="primary" form="admin-record-form">
              {saveLabel}
            </AdminButton>
          )}
        </div>
      </section>
    </div>
  );
}
