"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";

const auditTone = (outcome: string) =>
  outcome === "success" ? "success" : outcome === "denied" ? "danger" : "warning";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

export default function AdminAuditLogsPage() {
  const [records, setRecords] = useState<RecordType[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("audit_events")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((event) => ({
            id: event.id,
            title: `${event.action} — ${event.target}`,
            subtitle: event.actor,
            details: {
              Event: event.id,
              Actor: event.actor,
              Action: event.action,
              Target: event.target,
              Timestamp: event.created_at
                ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true })
                : "N/A",
              Outcome: event.outcome,
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  return (
    <AdminModulePage
      actionLabel="Export logs"
      allowCreate={false}
      columns={["Event", "Actor", "Action", "Target", "Timestamp", "Outcome", "Actions"]}
      description="Follow the people, actions, and outcomes that shape the Admin workspace."
      eyebrow="Audit logs"
      filterByTab={(tab, record) => tab === "All" || record.details.Outcome.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="id">{record.details.Event}</span>,
        <span className="admin-table-cell-secondary" key="actor">{record.details.Actor}</span>,
        <span className="admin-table-cell-secondary" key="action">{record.details.Action}</span>,
        <span className="admin-table-cell-secondary" key="target">{record.details.Target}</span>,
        <span className="admin-table-cell-secondary" key="timestamp">{record.details.Timestamp}</span>,
        <AdminBadge key="outcome" tone={auditTone(record.details.Outcome)}>{record.details.Outcome}</AdminBadge>,
      ]}
      rowActionMode="view"
      searchPlaceholder="Search actors, actions, targets, or outcomes"
      tabs={["All", "Success", "Denied", "Warning"]}
      title="Audit logs"
    />
  );
}
