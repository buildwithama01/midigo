"use client";

import type { AdminRecord } from "./adminTypes";

export default function AdminRowActions({
  actionLabel = "Manage",
  mode = "manage",
  onAction,
  onDelete,
  onEdit,
  onView,
  record,
}: {
  actionLabel?: string;
  mode?: "view" | "edit" | "manage";
  onAction?: () => void;
  onDelete: (record: AdminRecord) => void;
  onEdit: (record: AdminRecord) => void;
  onView: (record: AdminRecord) => void;
  record: AdminRecord;
}) {
  const showAction = mode !== "view" && onAction;
  const showEdit = mode !== "view" && onEdit;
  const showDelete = mode !== "view" && onDelete;

  return (
    <div className="admin-table-actions">
      {onView && (
        <button
          aria-label={`View ${record.title}`}
          className="admin-row-button"
          onClick={() => onView(record)}
          type="button"
        >
          View
        </button>
      )}
      {showAction && (
        <button
          aria-label={`${actionLabel} ${record.title}`}
          className="admin-row-button"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      )}
      {showEdit && (
        <button
          aria-label={`Edit ${record.title}`}
          className="admin-row-button"
          onClick={() => onEdit(record)}
          type="button"
        >
          Edit
        </button>
      )}
      {showDelete && (
        <button
          aria-label={`Delete ${record.title}`}
          className="admin-row-button admin-row-button-danger"
          onClick={() => onDelete(record)}
          type="button"
        >
          Delete
        </button>
      )}
    </div>
  );
}
