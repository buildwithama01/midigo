"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoMailUnreadOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { upsertConversationAction } from "@/app/admin/actions/upsertConversation";
import { getChattersAction } from "@/app/admin/actions/getChatters";

const conversationTone = (status: string) =>
  status === "resolved" ? "success" : status === "open" ? "accent" : "warning";

type RecordType = {
  id: string;
  title: string;
  subtitle: string;
  details: Record<string, string>;
};

export default function AdminMessagesPage() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [chatterOptions, setChatterOptions] = useState<string[]>([]);

  const fetchRecords = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((conversation) => ({
            id: conversation.id,
            title: conversation.subject,
            subtitle: conversation.fan_name,
            details: {
              Fan: conversation.fan_name ?? "Unknown",
              Subject: conversation.subject,
              Assignee: conversation.assignee_name ?? "Unassigned",
              Messages: String(conversation.message_count ?? 0),
              Status: conversation.status,
              Updated: conversation.updated_at
                ? formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })
                : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  const fetchChatters = useCallback(() => {
    void getChattersAction().then((chatters) => {
      setChatterOptions(chatters.map((c) => c.name));
    });
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchChatters();
  }, [fetchRecords, fetchChatters]);

  const dialogConfig: AdminDialogConfig = {
    icon: <IoMailUnreadOutline aria-hidden="true" />,
    createTitle: "New conversation",
    createDescription:
      "Start a support conversation and assign it to a chatter. All conversations are tracked in the inbox.",
    createLabel: "Start conversation",
    editTitle: "Edit conversation",
    editLabel: "Save changes",
    fields: [
      {
        key: "Fan",
        label: "Fan / member",
        type: "text",
        placeholder: "e.g. Luna Rodriguez",
      },
      {
        key: "Subject",
        label: "Subject",
        type: "text",
        placeholder: "e.g. Issue with VIP access",
      },
      {
        key: "Assignee",
        label: "Assigned to",
        type: "select",
        options: ["Unassigned", ...chatterOptions],
      },
      {
        key: "Status",
        label: "Status",
        type: "select",
        options: ["open", "waiting", "resolved"],
      },
    ],
  };

  return (
    <AdminModulePage
      actionLabel="New conversation"
      columns={["Fan", "Subject", "Assignee", "Messages", "Status", "Updated", "Actions"]}
      description="Review member conversations, balance assignments, and keep support moving."
      dialogConfig={dialogConfig}
      eyebrow="Messages & conversations"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="fan">{record.details.Fan}</span>,
        <span className="admin-table-cell-secondary" key="subject">{record.details.Subject}</span>,
        <span className="admin-table-cell-secondary" key="assignee">{record.details.Assignee}</span>,
        <span className="admin-table-cell-secondary" key="messages">{record.details.Messages}</span>,
        <AdminBadge key="status" tone={conversationTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="updated">{record.details.Updated}</span>,
      ]}
      rowActionLabel="Resolve"
      onRowAction={(record, actions) => {
        const nextStatus = record.details.Status === "resolved" ? "open" : "resolved";
        actions.update(record.id, { ...record.details, Status: nextStatus, Updated: "Just now" });
        return `${record.title} ${nextStatus === "resolved" ? "resolved" : "reopened"}.`;
      }}
      onCreate={async (values) => {
        await upsertConversationAction(values);
        fetchRecords();
      }}
      onUpdate={async (id, values) => {
        await upsertConversationAction({ ...values, id });
        fetchRecords();
      }}
      searchPlaceholder="Search conversations or assignees"
      tabs={["All", "Open", "Waiting", "Resolved"]}
      title="Messages & conversations"
    />
  );
}
