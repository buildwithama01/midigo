"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminBadge from "@/components/admin/AdminBadge";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminSection from "@/components/admin/AdminSection";
import AdminStatCard from "@/components/admin/AdminStatCard";
import AdminTable from "@/components/admin/AdminTable";
import AdminEmptyState from "@/components/admin/AdminEmptyState";
import {
  IoPeopleOutline,
  IoRadioOutline,
  IoFlagOutline,
  IoCashOutline,
  IoWarningOutline,
} from "react-icons/io5";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDistanceToNow } from "date-fns";
import { useTimeOfDayGreeting } from "@/hooks/useTimeOfDayGreeting";

type ActivityRow = {
  title: string;
  detail: string;
  time: string;
  tone: "accent" | "warning" | "success" | "info" | "danger";
};

type AlertItem = {
  title: string;
  detail: string;
  tone: "warning" | "danger" | "info" | "success" | "accent";
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const greeting = useTimeOfDayGreeting();
  const [activeUsers, setActiveUsers] = useState("—");
  const [liveRooms, setLiveRooms] = useState({
    count: 0,
    participants: 0,
    coverage: 0,
  });
  const [openCases, setOpenCases] = useState({ count: 0, high: 0 });
  const [monthlyRevenue, setMonthlyRevenue] = useState("—");
  const [activityRows, setActivityRows] = useState<ActivityRow[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [roomRows, setRoomRows] = useState<React.ReactNode[][]>([]);
  const [caseRows, setCaseRows] = useState<React.ReactNode[][]>([]);
  const [userRows, setUserRows] = useState<React.ReactNode[][]>([]);
  const [conversationItems, setConversationItems] = useState<
    {
      id: string;
      fan_name: string;
      subject: string;
      message_count: number;
      status: string;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      void Promise.resolve().then(() => setLoading(false));
      return;
    }

    const supabase = createClient();

    const fetchData = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push("/admin/login");
        return;
      }
      if (authData.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (profileData?.name) {
          setAdminName(profileData.name.split(" ")[0] ?? "Admin");
        }
      }

      const [
        profilesRes,
        roomsRes,
        casesRes,
        membershipsRes,
        recentActivityRes,
        conversationsRes,
      ] = await Promise.all([
        supabase.from("profiles").select("id, name, email, role, status"),
        supabase
          .from("live_rooms")
          .select(
            "id, title, host, current_participants, status, started_at, ended_at, created_at, scheduled_at",
          )
          .in("status", ["live", "upcoming"]),
        supabase
          .from("moderation_cases")
          .select("id, target, reason, severity, status, reporter, created_at")
          .in("status", ["open", "in_review"]),
        supabase
          .from("memberships")
          .select("amount_cents, status")
          .eq("status", "active"),
        supabase
          .from("audit_events")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(6),
        supabase
          .from("conversations")
          .select("id, fan_name, subject, message_count, status")
          .order("updated_at", { ascending: false })
          .limit(6),
      ]);

      const profiles = profilesRes.data ?? [];
      const rooms = roomsRes.data ?? [];
      const cases = casesRes.data ?? [];
      const memberships = membershipsRes.data ?? [];
      const activity = recentActivityRes.data ?? [];
      const conversations = conversationsRes.data ?? [];

      // Active users (count + newest)
      setActiveUsers(profiles.length.toLocaleString());

      // Live rooms stats
      const liveRoomsData = rooms.filter((r) => r.status === "live");
      const upcomingRooms = rooms.filter((r) => r.status === "upcoming");
      setLiveRooms({
        count: liveRoomsData.length,
        participants: liveRoomsData.reduce(
          (sum, r) => sum + (r.current_participants ?? 0),
          0,
        ),
        coverage: Math.max(0, liveRoomsData.length - 3),
      });

      // Open cases
      const highPriority = cases.filter((c) => c.severity === "high");
      setOpenCases({ count: cases.length, high: highPriority.length });

      // Revenue
      const revenue = memberships.reduce(
        (sum, m) => sum + (m.amount_cents ?? 0),
        0,
      );
      setMonthlyRevenue(`$${(revenue / 100 / 1000).toFixed(1)}k`);

      // Activity rows from audit_events
      const titleMap: Record<string, string> = {
        "Updated role": "Role updated",
        "Resolved case": "Case resolved",
        "Published article": "Content published",
        "Changed room status": "Room status changed",
        "Flagged message": "Message flagged",
      };
      const formattedActivity = activity.map<ActivityRow>((event) => {
        const tone =
          event.outcome === "success"
            ? "success"
            : event.outcome === "denied"
              ? "danger"
              : event.outcome === "warning"
                ? "warning"
                : "info";
        return {
          title: titleMap[event.action] ?? event.action,
          detail: event.target,
          time: event.created_at
            ? formatDistanceToNow(new Date(event.created_at), {
                addSuffix: true,
              })
            : "N/A",
          tone,
        };
      });
      setActivityRows(formattedActivity);

      // Alerts
      const alerts: AlertItem[] = [];
      if (highPriority.length > 0) {
        alerts.push({
          title: "Moderation priority",
          detail: `${highPriority.length} high-severity cases need review.`,
          tone: "danger",
        });
      }
      if (upcomingRooms.length > 0) {
        alerts.push({
          title: "Upcoming rooms",
          detail: `${upcomingRooms.length} rooms scheduled in the next 24 hours.`,
          tone: "warning",
        });
      }
      alerts.push({
        title: "System healthy",
        detail: "All Admin services are operating within normal limits.",
        tone: "info",
      });
      setAlertItems(alerts);

      // Room rows (live rooms table)
      const liveRoomRows = liveRoomsData.slice(0, 4).map((room) => [
        <span className="admin-table-cell-primary" key={room.id}>
          {room.title}
        </span>,
        <span className="admin-table-cell-secondary" key={`${room.id}-host`}>
          {room.host}
        </span>,
        <span
          className="admin-table-cell-secondary"
          key={`${room.id}-participants`}
        >
          {room.current_participants ?? 0}
        </span>,
        <AdminBadge
          key={`${room.id}-status`}
          tone={room.status === "live" ? "accent" : "info"}
        >
          {room.status}
        </AdminBadge>,
      ]);
      setRoomRows(liveRoomRows as React.ReactNode[][]);

      // Case rows (recent moderation)
      const caseRowsData = cases.slice(0, 4).map((item) => [
        <span className="admin-table-cell-primary" key={item.id}>
          {item.target}
        </span>,
        <span className="admin-table-cell-secondary" key={`${item.id}-reason`}>
          {item.reason}
        </span>,
        <AdminBadge
          key={`${item.id}-severity`}
          tone={
            item.severity === "high"
              ? "danger"
              : item.severity === "medium"
                ? "warning"
                : "info"
          }
        >
          {item.severity}
        </AdminBadge>,
        <AdminBadge
          key={`${item.id}-status`}
          tone={
            item.status === "resolved"
              ? "success"
              : item.status === "in_review"
                ? "warning"
                : "accent"
          }
        >
          {item.status}
        </AdminBadge>,
      ]);
      setCaseRows(caseRowsData as React.ReactNode[][]);

      // User rows (newest profiles)
      const userRowsData = profiles.slice(0, 4).map((user) => [
        <span className="admin-table-cell-primary" key={user.id}>
          {user.name || "Unknown"}
        </span>,
        <span className="admin-table-cell-secondary" key={`${user.id}-email`}>
          {user.email}
        </span>,
        <span className="admin-table-cell-secondary" key={`${user.id}-role`}>
          {user.role}
        </span>,
        <AdminBadge
          key={`${user.id}-status`}
          tone={
            user.status === "active"
              ? "success"
              : user.status === "pending"
                ? "warning"
                : "danger"
          }
        >
          {user.status}
        </AdminBadge>,
      ]);
      setUserRows(userRowsData as React.ReactNode[][]);

      // Conversation queue items
      setConversationItems(conversations);

      setLoading(false);
    };

    void fetchData();
  }, [router]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin workspace"
        title={`${greeting}, ${adminName || "Admin"}.`}
        description="A clear view of the people, rooms, content, and safety signals shaping Midigo today."
        actions={
          <>
            <Link className="admin-button" href="/admin/audit-logs">
              View audit logs
            </Link>
            <Link
              className="admin-button admin-button-primary"
              href="/admin/users"
            >
              Manage users
            </Link>
          </>
        }
      />

      <div className="admin-stats">
        <AdminStatCard
          icon={<IoPeopleOutline size={25} />}
          label="Active users"
          value={activeUsers}
          detail="Total profiles"
          tone="accent"
        />
        <AdminStatCard
          icon={<IoRadioOutline size={25} />}
          label="Live rooms"
          value={String(liveRooms.count)}
          detail={`${liveRooms.participants} participants · ${liveRooms.coverage} need coverage`}
          tone="warning"
        />
        <AdminStatCard
          icon={<IoFlagOutline size={25} />}
          label="Open cases"
          value={String(openCases.count)}
          detail={`${openCases.high} high priority`}
          tone="danger"
        />
        <AdminStatCard
          icon={<IoCashOutline size={25} />}
          label="Monthly revenue"
          value={monthlyRevenue}
          detail="Active memberships"
          tone="info"
        />
      </div>

      <div className="admin-module-grid">
        <AdminSection title="Recent activity" description="Platform signals">
          <AdminTable
            caption="Recent admin activity"
            columns={["Activity", "Details", "Time", "Type"]}
            rows={activityRows.map((item) => [
              <span
                className="admin-table-cell-primary"
                key={item.title + item.time}
              >
                {item.title}
              </span>,
              <span
                className="admin-table-cell-secondary"
                key={item.detail + item.time}
              >
                {item.detail}
              </span>,
              <span className="admin-table-cell-secondary" key={item.time}>
                {item.time}
              </span>,
              <AdminBadge key={item.title + item.detail} tone={item.tone}>
                Update
              </AdminBadge>,
            ])}
          />
          {activityRows.length === 0 && !loading && (
            <AdminEmptyState
              title="No recent activity"
              description="Activity will appear here as actions are performed."
            />
          )}
        </AdminSection>

        <AdminSection
          title="Live rooms"
          description="Rooms to watch"
          action={
            <Link className="admin-panel-link" href="/admin/live-rooms">
              View all
            </Link>
          }
        >
          <AdminTable
            caption="Active live rooms"
            columns={["Room", "Host", "People", "Status"]}
            rows={roomRows}
          />
          {roomRows.length === 0 && !loading && (
            <AdminEmptyState
              title="No active rooms"
              description="Rooms will appear here when they go live."
            />
          )}
        </AdminSection>
      </div>

      <div className="admin-module-grid">
        <AdminSection
          title="Moderation queue"
          description="Safety first"
          action={
            <Link className="admin-panel-link" href="/admin/moderation">
              Open queue
            </Link>
          }
        >
          <AdminTable
            caption="Recent moderation cases"
            columns={["Target", "Reason", "Severity", "Status"]}
            rows={caseRows}
          />
          {caseRows.length === 0 && !loading && (
            <AdminEmptyState
              title="No open cases"
              description="Everything looks clean."
            />
          )}
        </AdminSection>
        <AdminSection
          title="Newest users"
          description="Access overview"
          action={
            <Link className="admin-panel-link" href="/admin/users">
              Manage users
            </Link>
          }
        >
          <AdminTable
            caption="Newest admin users"
            columns={["Name", "Email", "Role", "Status"]}
            rows={userRows}
          />
          {userRows.length === 0 && !loading && (
            <AdminEmptyState
              title="No users"
              description="Users will appear here as they are added."
            />
          )}
        </AdminSection>
      </div>

      <div className="admin-module-grid">
        <AdminSection title="Admin alerts" description="Needs attention">
          <div className="admin-list">
            {alertItems.map((alert) => (
              <div className="admin-list-item" key={alert.title}>
                <span
                  className={`admin-list-icon admin-list-icon-${alert.tone}`}
                  aria-hidden="true"
                >
                  <IoWarningOutline />
                </span>
                <div className="admin-list-copy">
                  <strong>{alert.title}</strong>
                  <p>{alert.detail}</p>
                </div>
                <AdminBadge tone={alert.tone}>Review</AdminBadge>
              </div>
            ))}
          </div>
        </AdminSection>
        <AdminSection
          title="Conversation queue"
          description="Member support"
          action={
            <Link className="admin-panel-link" href="/admin/messages">
              Open messages
            </Link>
          }
        >
          <div className="admin-list">
            {conversationItems.slice(0, 3).map((conversation) => (
              <div className="admin-list-item" key={conversation.id}>
                <span className="admin-list-icon" aria-hidden="true">
                  {conversation.fan_name?.charAt(0) ?? "?"}
                </span>
                <div className="admin-list-copy">
                  <strong>{conversation.subject}</strong>
                  <p>
                    {conversation.fan_name ?? "Unknown fan"} ·{" "}
                    {conversation.message_count ?? 0} messages
                  </p>
                </div>
                <AdminBadge
                  tone={
                    conversation.status === "resolved" ? "success" : "accent"
                  }
                >
                  {conversation.status}
                </AdminBadge>
              </div>
            ))}
            {conversationItems.length === 0 && !loading && (
              <AdminEmptyState
                title="No conversations"
                description="All caught up."
              />
            )}
          </div>
        </AdminSection>
      </div>
    </>
  );
}
