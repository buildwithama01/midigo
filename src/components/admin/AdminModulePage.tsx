"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import AdminButton from "./AdminButton";
import AdminEmptyState from "./AdminEmptyState";
import AdminPageHeader from "./AdminPageHeader";
import AdminRecordDialog from "./AdminRecordDialog";
import AdminRowActions from "./AdminRowActions";
import AdminSearch from "./AdminSearch";
import AdminTable from "./AdminTable";
import AdminTabs from "./AdminTabs";
import {
  type AdminRecord,
  type AdminRecordActions,
  type AdminRecordDialogState,
  type AdminDialogConfig,
} from "./adminTypes";
import { useAdminWorkspace } from "./AdminWorkspaceContext";

export type AdminModulePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  columns: string[];
  records: AdminRecord[];
  renderRow: (record: AdminRecord, actions: AdminRecordActions) => ReactNode[];
  searchText?: (record: AdminRecord) => string[];
  filterByTab?: (tab: string, record: AdminRecord) => boolean;
  tabs?: string[];
  actionLabel?: string;
  searchPlaceholder?: string;
  rowActionLabel?: string;
  rowActionMode?: "view" | "edit" | "manage";
  allowCreate?: boolean;
  dialogConfig?: AdminDialogConfig;
  onCreate?: (values: Record<string, string>) => Promise<void>;
  onUpdate?: (id: string, values: Record<string, string>) => Promise<void>;
  onRowAction?: (
    record: AdminRecord,
    actions: AdminRecordActions,
  ) => string | void;
  children?: ReactNode;
};

const fieldColumns = (columns: string[]) =>
  columns.filter((column) => column !== "Actions");

const toCsvCell = (value: string) => {
  const normalized = value.replace(/"/g, '""');
  return /[",\n\r]/.test(normalized) ? `"${normalized}"` : normalized;
};

const createRecordId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `record-${Date.now()}`;

export default function AdminModulePage({
  eyebrow,
  title,
  description,
  columns,
  records,
  renderRow,
  searchText,
  filterByTab,
  tabs,
  actionLabel = "Create record",
  searchPlaceholder = "Search records",
  rowActionLabel = "Manage",
  rowActionMode = "manage",
  allowCreate = true,
  dialogConfig,
  onCreate,
  onUpdate,
  onRowAction,
  children,
}: AdminModulePageProps) {
  const [moduleRecords, setModuleRecords] = useState(records);
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(tabs?.[0] ?? "All");
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState<AdminRecordDialogState | null>(null);
  const { notify } = useAdminWorkspace();
  const normalizedQuery = query.trim().toLowerCase();
  const dialogFields = fieldColumns(columns);

  const filteredRecords = useMemo(
    () =>
      moduleRecords.filter((record) => {
        const searchValues = searchText?.(record) ?? [
          record.title,
          record.subtitle ?? "",
          ...Object.values(record.details),
        ];
        const matchesSearch = searchValues.some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        );
        const matchesTab = filterByTab?.(activeTab, record) ?? true;
        return matchesSearch && matchesTab;
      }),
    [activeTab, filterByTab, moduleRecords, normalizedQuery, searchText],
  );

  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const changeQuery = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setQuery("");
  };

  const updateRecord = useCallback((id: string, values: Record<string, string>) => {
    setModuleRecords((current) =>
      current.map((record) =>
        record.id === id
          ? { ...record, details: { ...record.details, ...values } }
          : record,
      ),
    );
    void onUpdate?.(id, values);
  }, [onUpdate]);

  const removeRecord = useCallback(
    (id: string) => {
      const record = moduleRecords.find((item) => item.id === id);
      if (!record) return;

      if (
        !window.confirm(
          `Delete ${record.title}? This action cannot be undone in this workspace.`,
        )
      ) {
        return;
      }

      setModuleRecords((current) =>
        current.filter((item) => item.id !== id),
      );
      notify(`${record.title} deleted.`);
    },
    [moduleRecords, notify],
  );

  const exportRecords = () => {
    const headers = fieldColumns(columns);
    const lines = [
      headers.map(toCsvCell).join(","),
      ...filteredRecords.map((record) =>
        headers
          .map((header) =>
            toCsvCell(record.details[header] ?? record.subtitle ?? record.title),
          )
          .join(","),
      ),
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    notify(`${filteredRecords.length} records exported.`);
  };

  const createRecord = (values: Record<string, string>) => {
    const titleField = dialogFields[0] ?? "Title";
    const recordTitle = values[titleField]?.trim() || "Untitled";
    const subtitleField = dialogFields[1];
    const newRecord: AdminRecord = {
      id: createRecordId(),
      title: recordTitle,
      ...(subtitleField && values[subtitleField]?.trim()
        ? { subtitle: values[subtitleField] }
        : {}),
      details: values,
    };
    setModuleRecords((current) => [newRecord, ...current]);
    void onCreate?.(values);
    notify(`${recordTitle} created.`);
  };

  const saveRecord = (values: Record<string, string>) => {
    if (dialog?.mode === "edit" && dialog.record) {
      updateRecord(dialog.record.id, values);
      notify(`${dialog.record.title} updated.`);
    } else {
      createRecord(values);
    }
    setDialog(null);
  };

  const recordActions: AdminRecordActions = {
    onView: (record) => setDialog({ mode: "view", record }),
    onEdit: (record) => setDialog({ mode: "edit", record }),
    update: updateRecord,
    remove: removeRecord,
  };

  const rows = visibleRecords.map((record) => {
    const cells = renderRow(record, recordActions);
    if (!columns.includes("Actions")) return cells;

    return [
      ...cells,
      <AdminRowActions
        actionLabel={rowActionLabel}
        key={`actions-${record.id}`}
        mode={rowActionMode}
        onAction={
          onRowAction
            ? () => {
                const message = onRowAction(record, recordActions);
                if (message) notify(message);
              }
            : undefined
        }
        onDelete={(record) => removeRecord(record.id)}
        onEdit={recordActions.onEdit}
        onView={recordActions.onView}
        record={record}
      />,
    ];
  });

  return (
    <>
      <AdminPageHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={
          <>
            {allowCreate && (
              <AdminButton onClick={() => setDialog({ mode: "create" })}>
                {actionLabel}
              </AdminButton>
            )}
            <AdminButton onClick={exportRecords} variant="secondary">
              Export
            </AdminButton>
          </>
        }
      />

      <div className="admin-toolbar">
        <AdminSearch
          ariaLabel={`Search ${title.toLowerCase()}`}
          onChange={changeQuery}
          placeholder={searchPlaceholder}
          value={query}
        />
        {tabs && (
          <AdminTabs
            ariaLabel={`${title} filters`}
            onChange={changeTab}
            tabs={tabs}
            value={activeTab}
          />
        )}
      </div>

      {rows.length > 0 ? (
        <AdminTable caption={title} columns={columns} rows={rows} />
      ) : (
        <AdminEmptyState
          title="No records found"
          description="Try a different search or filter to find what you need."
        />
      )}

      <div className="admin-table-count">
        Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
        –{Math.min(currentPage * pageSize, filteredRecords.length)} of{" "}
        {filteredRecords.length} records
        {totalPages > 1 && (
          <span className="admin-pagination">
            <button
              aria-label="Previous page"
              className="admin-icon-action"
              disabled={currentPage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              aria-label="Next page"
              className="admin-icon-action"
              disabled={currentPage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              type="button"
            >
              Next
            </button>
          </span>
        )}
      </div>

      {dialog && (
        <AdminRecordDialog
          columns={dialogFields}
          config={dialogConfig}
          key={`${dialog.mode}-${dialog.record?.id ?? "create"}-${JSON.stringify(dialog.record?.details ?? {})}`}
          mode={dialog.mode}
          record={dialog.mode === "create" ? undefined : dialog.record}
          onClose={() => setDialog(null)}
          onSave={saveRecord}
        />
      )}

      {children}
    </>
  );
}
