"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminModulePage from "@/src/components/admin/AdminModulePage";
import type { AdminDialogConfig } from "@/src/components/admin/adminTypes";
import { IoRadioOutline } from "react-icons/io5";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { upsertLiveRoomAction } from "@/app/admin/actions/upsertLiveRoom";

const roomTone = (status: string) =>
  status === "live" ? "accent" : status === "ended" ? "default" : "info";

const dialogConfig: AdminDialogConfig = {
  icon: <IoRadioOutline aria-hidden="true" />,
  createTitle: "Schedule room",
  createDescription:
    "Set up a new live room session. Assign a host and set the expected start time.",
  createLabel: "Schedule room",
  editTitle: "Edit room",
  editLabel: "Save changes",
  fields: [
    {
      key: "Room",
      label: "Room title",
      type: "text",
      placeholder: "e.g. Friday Night Q&A",
    },
    {
      key: "Host",
      label: "Host name",
      type: "text",
      placeholder: "e.g. DJ Midigo",
    },
    {
      key: "Participants",
      label: "Max participants",
      type: "text",
      placeholder: "e.g. 500",
    },
    {
      key: "Status",
      label: "Status",
      type: "select",
      options: ["live", "upcoming", "ended"],
    },
    {
      key: "Started",
      label: "Scheduled start",
      type: "text",
      placeholder: "e.g. Today 9:00 PM",
    },
  ],
};

export default function AdminLiveRoomsPage() {
  const [records, setRecords] = useState<
    {
      id: string;
      title: string;
      subtitle: string;
      details: Record<string, string>;
    }[]
  >([]);

  const fetchLiveRooms = useCallback(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase
      .from("live_rooms")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data && !error) {
          const formatted = data.map((room) => ({
            id: room.id,
            title: room.title,
            subtitle: room.host,
            details: {
              Room: room.title,
              Host: room.host,
              Participants: String(room.current_participants ?? 0),
              Status: room.status,
              Started: room.started_at
                ? formatDistanceToNow(new Date(room.started_at), { addSuffix: true })
                : room.scheduled_at
                  ? formatDistanceToNow(new Date(room.scheduled_at), { addSuffix: true })
                  : "N/A",
            },
          }));
          setRecords(formatted);
        }
      });
  }, []);

  useEffect(() => {
    fetchLiveRooms();
  }, [fetchLiveRooms]);

  return (
    <AdminModulePage
      actionLabel="Schedule room"
      columns={["Room", "Host", "Participants", "Status", "Started", "Actions"]}
      description="Coordinate live sessions, monitor attendance, and keep room coverage visible."
      dialogConfig={dialogConfig}
      eyebrow="Live-room management"
      filterByTab={(tab, record) => tab === "All" || record.details.Status.toLowerCase() === tab.toLowerCase()}
      records={records}
      renderRow={(record) => [
        <span className="admin-table-cell-primary" key="title">{record.details.Room}</span>,
        <span className="admin-table-cell-secondary" key="host">{record.details.Host}</span>,
        <span className="admin-table-cell-secondary" key="participants">{record.details.Participants}</span>,
        <AdminBadge key="status" tone={roomTone(record.details.Status)}>{record.details.Status}</AdminBadge>,
        <span className="admin-table-cell-secondary" key="started">{record.details.Started}</span>,
      ]}
      rowActionLabel="End room"
      onRowAction={(record, actions) => {
        const nextStatus = record.details.Status === "ended" ? "live" : "ended";
        actions.update(record.id, { ...record.details, Status: nextStatus, Started: "Just now" });
        return `${record.title} marked ${nextStatus === "ended" ? "ended" : "live"}.`;
      }}
      onCreate={async (values) => {
        await upsertLiveRoomAction(values);
        fetchLiveRooms();
      }}
      onUpdate={async (id, values) => {
        await upsertLiveRoomAction({ ...values, id });
        fetchLiveRooms();
      }}
      searchPlaceholder="Search rooms, hosts, or status"
      tabs={["All", "Live", "Upcoming", "Ended"]}
      title="Live rooms"
    />
  );
}
