"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { useTimeOfDayGreeting } from "@/hooks/useTimeOfDayGreeting";
import { useChatterWorkspace } from "./ChatterWorkspaceContext";
import type { Conversation, LiveRoom, ModerationCase } from "./chatterTypes";

type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type Room = Database["public"]["Tables"]["live_rooms"]["Row"];
type ModerationCaseRow =
  Database["public"]["Tables"]["moderation_cases"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();
}

function displayTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

type ChatterWithConversations = {
  id: string;
  conversations: ConversationRow[];
};

function mapConversation(
  row: ConversationRow,
  messageRows: MessageRow[],
): Conversation {
  const thread = messageRows.filter(
    (message) => message.conversation_id === row.id,
  );
  const latest = thread[thread.length - 1];
  return {
    id: row.id,
    fanName: row.fan_name,
    avatar: initials(row.fan_name),
    online: false,
    unread: thread.filter(
      (message) => !message.read && message.sender === "fan",
    ).length,
    priority: "standard",
    preview: latest?.content ?? row.subject,
    timestamp: displayTime(latest ? latest.created_at : row.updated_at),
    messages: thread.map((message) => ({
      id: message.id,
      from: message.sender === "midigo" ? "midigo" : message.sender,
      content: message.content ?? "",
      timestamp: displayTime(message.created_at),
      read: message.read,
    })),
  };
}

function mapRoom(row: Room): LiveRoom {
  return {
    id: row.id,
    title: row.title,
    description: "",
    live: row.status === "live",
    slowMode: false,
    locked: false,
    participants: [],
    messages: [],
  };
}

function mapModerationCase(row: ModerationCaseRow): ModerationCase {
  return {
    id: row.id,
    roomId: row.id,
    participantId: row.assigned_to ?? row.id,
    participantName: row.target,
    message: "",
    reason: row.reason,
    severity: row.severity,
    status: row.status === "resolved" ? "resolved" : "open",
    createdAt: new Date(row.created_at).toLocaleDateString([], {
      month: "short",
      day: "numeric",
    }),
  };
}

function StatCard({
  label,
  value,
  detail,
  tone = "purple",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: "purple" | "lime" | "neutral";
}) {
  return (
    <div className="chatter-stat-card">
      <div className={`chatter-stat-icon chatter-stat-icon-${tone}`}>
        <span />
      </div>
      <div>
        <p className="label">{label}</p>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Conversation["priority"] }) {
  return (
    <span className={`chatter-priority chatter-priority-${priority}`}>
      {priority}
    </span>
  );
}

function RoomCard({ room }: { room: LiveRoom }) {
  return (
    <article className="chatter-room-card">
      <div className="chatter-room-card-top">
        <div className="chatter-room-avatar">{room.title.slice(0, 2)}</div>
        <div>
          <div className="chatter-room-title-row">
            <h3>{room.title}</h3>
            <span
              className={`chatter-live-badge ${room.live ? "is-live" : ""}`}
            >
              <i /> {room.live ? "Live" : "Upcoming"}
            </span>
          </div>
          <p>{room.description}</p>
        </div>
      </div>
      <div className="chatter-room-card-footer">
        <span>{room.participants.filter((p) => p.online).length} online</span>
        <span>{room.slowMode ? "Slow mode" : "Open chat"}</span>
        <Link href="/chatter/live">
          Enter room <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </article>
  );
}

function ConversationRow({ conversation }: { conversation: Conversation }) {
  return (
    <Link
      className="chatter-overview-conversation"
      href="/chatter/conversations"
    >
      <div className="chatter-avatar chatter-avatar-purple">
        {conversation.avatar}
      </div>
      <div className="chatter-overview-conversation-copy">
        <div className="chatter-conversation-name-row">
          <strong>{conversation.fanName}</strong>
          <PriorityBadge priority={conversation.priority} />
        </div>
        <p>{conversation.preview}</p>
      </div>
      <div className="chatter-overview-conversation-meta">
        <span>{conversation.timestamp}</span>
        {conversation.unread > 0 && <b>{conversation.unread}</b>}
      </div>
    </Link>
  );
}

function ModerationRow({ item }: { item: ModerationCase }) {
  return (
    <Link className="chatter-moderation-row" href="/chatter/moderation">
      <span className={`chatter-severity-dot severity-${item.severity}`} />
      <div>
        <strong>{item.participantName}</strong>
        <p>{item.reason}</p>
      </div>
      <span className="chatter-muted-small">{item.createdAt}</span>
      <span aria-hidden="true">↗</span>
    </Link>
  );
}

export default function ChatterOverview() {
  const { online } = useChatterWorkspace();
  const greeting = useTimeOfDayGreeting();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [rooms, setRooms] = useState<LiveRoom[]>([]);
  const [cases, setCases] = useState<ModerationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve()
      .then(() => createClient())
      .then(async (supabase) => {
        if (cancelled) return;

        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          setLoading(false);
          return;
        }

        const [
          { data: profileData },
          { data: roomData, error: roomError },
          // Join chatters → conversations so we filter by chatters.id (not profiles.id)
          { data: conversationRows, error: conversationError },
          { data: messageRows },
          { data: caseData, error: caseError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", authData.user.id)
            .maybeSingle(),
          supabase
            .from("live_rooms")
            .select("*")
            .in("status", ["live", "upcoming"])
            .order("scheduled_at", { ascending: true, nullsFirst: false })
            .limit(4),
          // Find the chatter row matching this user's profile,
          // then load conversations assigned to that chatter's id.
          supabase
            .from("chatters")
            .select("id, conversations!inner(*)")
            .eq("profile_id", authData.user.id)
            .order("conversations.updated_at", { ascending: false })
            .limit(10) as unknown as Promise<{
              data: ChatterWithConversations[] | null;
              error: { message: string } | null;
            }>,
          supabase
            .from("messages")
            .select("*")
            .order("created_at", { ascending: true }),
          supabase
            .from("moderation_cases")
            .select("*")
            .eq("assigned_to", authData.user.id)
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (cancelled) return;
        setProfile(profileData);

        if (!conversationError && conversationRows) {
          // Flatten the nested conversations from the chatters join
          const flatConversations = conversationRows
            .flatMap((chatter) => chatter.conversations ?? [])
            .map((row) => mapConversation(row, messageRows ?? []));
          setConversations(flatConversations);
        }

        if (!roomError && roomData) {
          setRooms(roomData.map(mapRoom));
        }

        if (!caseError && caseData) {
          setCases(caseData.map(mapModerationCase));
        }

        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = conversations.reduce(
    (total, conversation) => total + conversation.unread,
    0,
  );
  const activeRooms = rooms.filter((room) => room.live).length;
  const openCases = cases.filter((item) => item.status === "open").length;
  const recentConversations = [...conversations].sort((a, b) => {
    if (a.unread !== b.unread) return b.unread - a.unread;
    return a.timestamp.localeCompare(b.timestamp);
  });
  const recentRooms = rooms.filter((room) => room.live);
  const recentFlags = cases.filter((item) => item.status === "open");

  return (
    <div className="chatter-overview">
      <div className="chatter-page-header">
        <div className="chatter-page-header-copy">
          <p className="label label-purple">Chatter workspace</p>
          <h1>
            {greeting}, {profile?.name?.split(" ")[0] ?? "there"}.
          </h1>
          <p>
            You&apos;re{" "}
            {online ? "visible to the community" : "currently hidden from fans"}
            . Here&apos;s what needs your attention across the Midigo rooms.
          </p>
        </div>
        <div className="chatter-page-header-actions">
          <Link
            className="btn btn-ghost chatter-header-button"
            href="/chatter/conversations"
          >
            Open queue
          </Link>
          <Link
            className="btn btn-lime chatter-header-button"
            href="/chatter/live"
          >
            Join a room
          </Link>
        </div>
      </div>

      <section className="chatter-stat-grid" aria-label="Workspace summary">
        <StatCard
          label="Assigned"
          value={conversations.length}
          detail="conversations in queue"
        />
        <StatCard
          label="Unread"
          value={unreadCount}
          detail="messages waiting for reply"
          tone="lime"
        />
        <StatCard
          label="Rooms live"
          value={activeRooms}
          detail={`${rooms.length - activeRooms} rooms upcoming`}
          tone="purple"
        />
        <StatCard
          label="Open flags"
          value={openCases}
          detail="need review today"
          tone={openCases ? "lime" : "neutral"}
        />
      </section>

      {loading && (
        <p className="admin-table-cell-secondary" style={{ marginTop: "1rem" }}>
          Loading workspace…
        </p>
      )}

      <div className="chatter-overview-grid">
        <section className="chatter-panel chatter-panel-large">
          <div className="chatter-panel-heading">
            <div>
              <p className="label label-purple">Priority queue</p>
              <h2>Assigned conversations</h2>
            </div>
            <Link href="/chatter/conversations">
              View all <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="chatter-overview-conversation-list">
            {recentConversations.slice(0, 4).map((conversation) => (
              <ConversationRow
                conversation={conversation}
                key={conversation.id}
              />
            ))}
            {recentConversations.length === 0 && !loading && (
              <p className="chatter-empty-text">
                No conversations assigned to you right now.
              </p>
            )}
          </div>
        </section>

        <section className="chatter-panel">
          <div className="chatter-panel-heading">
            <div>
              <p className="label label-purple">Room pulse</p>
              <h2>Live rooms</h2>
            </div>
            <Link href="/chatter/live">
              Open console <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="chatter-room-stack">
            {recentRooms.map((room) => (
              <RoomCard room={room} key={room.id} />
            ))}
            {recentRooms.length === 0 && !loading && (
              <p className="chatter-empty-text">No rooms are live right now.</p>
            )}
          </div>
        </section>
      </div>

      <section className="chatter-panel chatter-moderation-panel">
        <div className="chatter-panel-heading">
          <div>
            <p className="label label-purple">Community care</p>
            <h2>Moderation alerts</h2>
          </div>
          <Link href="/chatter/moderation">
            Review cases <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="chatter-moderation-list">
          {recentFlags.map((item) => (
            <ModerationRow item={item} key={item.id} />
          ))}
          {recentFlags.length === 0 && (
            <p className="chatter-empty-text">
              No open flags. The rooms are clear.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
