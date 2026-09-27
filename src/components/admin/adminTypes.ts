import type { ReactNode } from "react";

export type AdminRecord = {
  id: string;
  title: string;
  subtitle?: string;
  details: Record<string, string>;
};

export type AdminRecordDialogMode = "create" | "edit" | "view";

export type AdminRecordDialogState =
  | { mode: "create"; record?: never }
  | { mode: "edit" | "view"; record: AdminRecord };

export type AdminRecordActions = {
  onView: (record: AdminRecord) => void;
  onEdit: (record: AdminRecord) => void;
  update: (id: string, values: Record<string, string>) => void;
  remove: (id: string) => void;
};

export type AdminDialogFieldConfig = {
  /** The key that maps to the record's details field */
  key: string;
  /** Label shown in the dialog (defaults to key) */
  label?: string;
  /** Input type */
  type?: "text" | "email" | "select" | "textarea" | "file" | "url";
  /** Placeholder text */
  placeholder?: string;
  /** Options for select fields */
  options?: string[];
  /** Whether the field is required */
  required?: boolean;
  /** Whether to show in view mode (defaults to true) */
  showInView?: boolean;
};

export type AdminDialogConfig = {
  /** Icon shown in the dialog header */
  icon?: ReactNode;
  /** Dialog title for create mode */
  createTitle?: string;
  /** Short description / subtitle shown under the title in create mode */
  createDescription?: string;
  /** Dialog title for edit mode */
  editTitle?: string;
  /** Dialog title for view mode */
  viewTitle?: string;
  /** Label for the save/submit button in create mode */
  createLabel?: string;
  /** Label for the save/submit button in edit mode */
  editLabel?: string;
  /** Field-level configuration; order matters and controls render order */
  fields?: AdminDialogFieldConfig[];
};
