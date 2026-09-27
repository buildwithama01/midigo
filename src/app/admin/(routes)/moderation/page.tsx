"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoFlagOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { upsertModerationCaseAction } from "@/app/admin/actions/upsertModerationCase";

const severityTone = (severity: string) =>
  severity === "high" ? "danger" : severity === "medium" ? "warning" : "info";

const caseTone = (status: string) =>
  status === "resolved" ? "success" : status === "in_review" ? "warning" : "accent";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

const dialogConfig: AdminDialogConfig = {
  icon: <IoFlagOutline aria-hidden="true" />,
  createTitle: "Add case",
  createDescription:
    "Open a new moderation case. All cases are logged and visible in the audit trail.",
  createLabel: "Open case",
  editTitle: "Edit case",
  editLabel: "Save changes",
  fields: [
    {
      key: "Target",
      label: "Target user or content",
      type: "text",
      placeholder: "e.g. @username or content title",
    },
    {
      key: "Reason",
      label: "Reason",
      type: "select",
      options: [
        "Harassment",
        "Spam",
        "Inappropriate content",
        "Impersonation",
        "Hate speech",
        "Abuse of system",
        "Other",
      ],
    },
    {
      key: "Severity",
      label: "Severity",
      type: "select",
      options: ["low", "medium", "high"],
    },
    {
      key: "Status",
      label: "Case status",
      type: "select",
      options: ["open", "in_review", "resolved"],
    },
    {
      key: "Reporter",
      label: "Reported by",
      type: "text",
      placeholder: "e.g. System or @username",
    },
  ],
};

export default function AdminModerationPage() {
  const [records, setRecords] = useState<RecordType[]>([]);

  const fetchCases = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("moderation_cases")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((item) => ({
            id: item.id,
            title: item.target,
            subtitle: item.reason,
            details: {
              Target: item.target,
              Reason: item.reason,
              Severity: item.severity,
              Status: item.status,
              Reporter: item.reporter,
              Updated: item.created_at
                ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const { can, loading: roleLoading } = usePermissions();
  const canResolve = can("moderator");

  return (
    <AdminModulePage
      actionLabel="Add case"
      columns={["Target", "Reason", "Severity", "Status", "Reporter", "Updated", "Actions"]}
      description="Triage reports, protect live rooms, and keep every safety decision accountable."
      dialogConfig={dialogConfig}
      eyebrow="Moderation tools"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="target">{record.details.Target}</span>,
        <span className="admin-table-cell-secondary" key="reason">{record.details.Reason}</span>,
        <AdminBadge key="severity" tone={severityTone(record.details.Severity)}>{record.details.Severity}</AdminBadge>,
        <AdminBadge key="status" tone={caseTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="reporter">{record.details.Reporter}</span>,
        <span className="admin-table-cell-secondary" key="updated">{record.details.Updated}</span>,
      ]}
      rowActionLabel={canResolve ? "Resolve" : "View only"}
      onRowAction={canResolve
        ? (record, actions) => {
            const nextStatus = record.details.Status === "resolved" ? "open" : "resolved";
            actions.update(record.id, { ...record.details, Status: nextStatus, Updated: "Just now" });
            return `${record.title} ${nextStatus === "resolved" ? "resolved" : "reopened"}.`;
          }
        : undefined}
      onCreate={async (values) => {
        await upsertModerationCaseAction(values);
        fetchCases();
      }}
      onUpdate={async (id, values) => {
        await upsertModerationCaseAction({ ...values, id });
        fetchCases();
      }}
      searchPlaceholder="Search cases, reasons, or reporters"
      tabs={["All", "Open", "In review", "Resolved"]}
      title="Moderation"
    />
  );
}
