"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { upsertChatterAction } from "@/app/admin/actions/upsertChatter";

const presenceTone = (presence: string) =>
  presence === "online" ? "accent" : presence === "away" ? "warning" : "default";

const statusTone = (status: string) =>
  status === "available" ? "success" : status === "busy" ? "warning" : "default";

export default function AdminChatterPage() {
  const [records, setRecords] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      details: Record<string, string>;
    }[]
  >([]);
  const [profileOptions, setProfileOptions] = useState<string[]>([]);

  const fetchChatters = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("chatters")
      .select("*")
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((chatter) => ({
            id: chatter.id,
            title: chatter.name,
            subtitle: chatter.queue,
            details: {
              Chatter: chatter.name,
              Queue: chatter.queue,
              Presence: chatter.presence,
              Conversations: String(chatter.active_conversations ?? 0),
              "Response time": chatter.avg_response_time ?? "—",
              Status: chatter.status,
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  const fetchProfileOptions = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("name")
      .not("name", "is", null)
      .order("name")
      .then(({ data, error }) => {
        if (data && !error) {
          setProfileOptions(data.map((p) => p.name!));
        }
      });
  }, []);

  useEffect(() => {
    fetchChatters();
    fetchProfileOptions();
  }, [fetchChatters, fetchProfileOptions]);

  const dialogConfig: AdminDialogConfig = {
    icon: <IoChatbubbleOutline aria-hidden="true" />,
    createTitle: "Assign chatter",
    createDescription:
      "Add a new chatter to the workspace and assign them to a support queue.",
    createLabel: "Assign chatter",
    editTitle: "Edit chatter",
    editLabel: "Save changes",
    fields: [
      {
        key: "Chatter",
        label: "Chatter name",
        type: "text",
        placeholder: "e.g. Jordan Smith",
      },
      {
        key: "Profile",
        label: "Workspace user",
        type: "select",
        options: profileOptions,
        required: false,
      },
      {
        key: "Queue",
        label: "Support queue",
        type: "select",
        options: ["General", "VIP", "Billing", "Technical", "Live rooms"],
      },
      {
        key: "Presence",
        label: "Presence",
        type: "select",
        options: ["online", "away", "offline"],
      },
      {
        key: "Conversations",
        label: "Active conversations",
        type: "text",
        placeholder: "0",
      },
      {
        key: "Response time",
        label: "Avg. response time",
        type: "text",
        placeholder: "e.g. 2 min",
      },
      {
        key: "Status",
        label: "Availability status",
        type: "select",
        options: ["available", "busy", "offline"],
      },
    ],
  };

  return (
    <AdminModulePage
      actionLabel="Assign chatter"
      columns={["Chatter", "Queue", "Presence", "Conversations", "Response time", "Status", "Actions"]}
      description="Monitor agent availability, queue coverage, and response performance."
      dialogConfig={dialogConfig}
      eyebrow="Chatter management"
      filterByTab={(tab, record) =>
        tab === "All" ||
        record.details.Presence.toLowerCase() === tab.toLowerCase()
      }
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="name">{record.details.Chatter}</span>,
        <span className="admin-table-cell-secondary" key="queue">{record.details.Queue}</span>,
        <AdminBadge key="presence" tone={presenceTone(record.details.Presence)}>{record.details.Presence}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="conversations">{record.details.Conversations}</span>,
        <span className="admin-table-secondary" key="response">{record.details["Response time"]}</span>,
        <AdminBadge key="status" tone={statusTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
      ]}
      rowActionLabel="Toggle status"
      onRowAction={(record, actions) => {
        const nextPresence = record.details.Presence === "online" ? "away" : "online";
        const nextStatus = nextPresence === "online" ? "available" : "busy";
        actions.update(record.id, { ...record.details, Presence: nextPresence, Status: nextStatus });
        return `${record.title} marked ${nextPresence}.`;
      }}
      onCreate={async (values) => {
        await upsertChatterAction(values);
        fetchChatters();
      }}
      onUpdate={async (id, values) => {
        await upsertChatterAction({ ...values, id });
        fetchChatters();
      }}
      searchPlaceholder="Search chatters or queues"
      tabs={["All", "Online", "Away", "Offline"]}
      title="Chatter"
    />
  );
}
