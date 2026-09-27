"use client";

import AdminBadge from "@/src/components/admin/AdminBadge";
import AdminButton from "@/src/components/admin/AdminButton";
import AdminPageHeader from "@/src/components/admin/AdminPageHeader";
import AdminSection from "@/src/components/admin/AdminSection";
import { useAdminWorkspace } from "@/src/components/admin/AdminWorkspaceContext";
import {
  IoTrendingUpOutline,
  IoAnalyticsOutline,
  IoTimeOutline,
  IoCashOutline,
  IoRadioOutline,
  IoCalendarOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
} from "react-icons/io5";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { format, parseISO, eachDayOfInterval, formatDistanceToNow } from "date-fns";

type MetricCard = {
  label: string;
  value: string;
  detail: string;
  tone: "accent" | "info" | "warning" | "danger" | "success";
  icon: React.ReactNode;
};

type ActivityItem = {
  title: string;
  detail: string;
  time: string;
  tone: "accent" | "info" | "warning" | "danger" | "success";
};

type ChartColumn = {
  label: string;
  value: string;
};

export default function AdminAnalyticsPage() {
  const { notify } = useAdminWorkspace();
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [chartData, setChartData] = useState<ChartColumn[]>([]);
  const [chartHeights, setChartHeights] = useState<number[]>([]);
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([]);
  const [roomStats, setRoomStats] = useState<{ live: number; liveParticipants: number; upcoming: number; ended: number }>(
    { live: 0, liveParticipants: 0, upcoming: 0, ended: 0 },
  );
  const [conversationStats, setConversationStats] = useState<{ open: number; waiting: number; resolved: number; totalOpen: number }>(
    { open: 0, waiting: 0, resolved: 0, totalOpen: 0 },
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();

    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const [
        profilesRes,
        roomsRes,
        conversationsRes,
        membershipsRes,
        auditRes,
        moderationRes,
        articlesRes,
      ] = await Promise.all([
        supabase.from("profiles").select("created_at, updated_at, membership"),
        supabase.from("live_rooms").select("status, current_participants"),
        supabase.from("conversations").select("status"),
        supabase.from("memberships").select("amount_cents, status"),
        supabase.from("audit_events").select("*").order("created_at", { ascending: false }).limit(10),
        supabase.from("moderation_cases").select("*").order("created_at", { ascending: false }).limit(4),
        supabase.from("content_articles").select("title, status").order("updated_at", { ascending: false }).limit(4),
      ]);

      // --- Metrics cards ---
      const profiles = profilesRes.data ?? [];
      const activeMembers = profiles.length;
      const newThisWeek = profiles.filter(
        (p) => p.created_at && new Date(p.created_at) >= sevenDaysAgo,
      ).length;
      const vipCount = profiles.filter((p) => p.membership === "vip").length;

      const rooms = roomsRes.data ?? [];
      const liveRooms = rooms.filter((r) => r.status === "live");
      const liveParticipants = liveRooms.reduce((sum, r) => sum + (r.current_participants ?? 0), 0);

      const conversations = conversationsRes.data ?? [];
      const openConversations = conversations.filter((c) => c.status !== "resolved").length;

      const memberships = membershipsRes.data ?? [];
      const monthlyRevenue = memberships
        .filter((m) => m.status === "active")
        .reduce((sum, m) => sum + (m.amount_cents ?? 0), 0);

      setRoomStats({
        live: liveRooms.length,
        liveParticipants,
        upcoming: rooms.filter((r) => r.status === "upcoming").length,
        ended: rooms.filter((r) => r.status === "ended").length,
      });

      setConversationStats({
        open: conversations.filter((c) => c.status === "open").length,
        waiting: conversations.filter((c) => c.status === "waiting").length,
        resolved: conversations.filter((c) => c.status === "resolved").length,
        totalOpen: openConversations,
      });

      setMetrics([
        {
          label: "Active members",
          value: activeMembers.toLocaleString(),
          detail: `${newThisWeek} joined this week · ${vipCount} VIP`,
          tone: "accent",
          icon: <IoTrendingUpOutline />,
        },
        {
          label: "Engagement rate",
          value: activeMembers > 0 ? `${Math.round((liveParticipants / activeMembers) * 100)}%` : "0%",
          detail: `${liveParticipants} active in rooms`,
          tone: "info",
          icon: <IoAnalyticsOutline />,
        },
        {
          label: "Avg. response",
          value: openConversations > 0 ? `< ${Math.ceil(openConversations / 2)} min` : "N/A",
          detail: "Within target",
          tone: "warning",
          icon: <IoTimeOutline />,
        },
        {
          label: "Monthly revenue",
          value: `$${(monthlyRevenue / 100).toFixed(1)}k`,
          detail: `+${memberships.filter((m) => m.status === "active").length} active members`,
          tone: "danger",
          icon: <IoCashOutline />,
        },
      ]);

      // --- Chart data (last 7 days) ---
      const dayBuckets = eachDayOfInterval({ start: sevenDaysAgo, end: now });
      const dayLabels = dayBuckets.map((d) => format(d, "EEE"));
      const dayCounts = dayBuckets.map((day) => {
        const start = day.setHours(0, 0, 0, 0);
        const end = day.setHours(23, 59, 59, 999);
        return profiles.filter(
          (p) => p.created_at && new Date(p.created_at).getTime() >= start && new Date(p.created_at).getTime() <= end,
        ).length;
      });
      const maxCount = Math.max(...dayCounts, 1);
      setChartData(
        dayLabels.map((label, i) => ({
          label,
          value: `${dayCounts[i]}`,
        })),
      );
      setChartHeights(dayCounts.map((count) => Math.round((count / maxCount) * 100)));

      // --- Activity feed ---
      const activities: ActivityItem[] = [];
      (auditRes.data ?? []).slice(0, 4).forEach((event) => {
        activities.push({
          title: event.action,
          detail: event.target,
          time: event.created_at
            ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true })
            : "N/A",
          tone: event.outcome === "success" ? "success" : event.outcome === "denied" ? "danger" : "warning",
        });
      });
      setActivityItems(activities);

      setLoading(false);
    };

    void fetchData();
  }, []);

  const downloadReport = () => {
    const trendRows = chartData.map((item) => [item.label, item.value]);
    const roomRows = [
      ["Room status", "Count"],
      ["Live", String(roomStats.live)],
      ["Upcoming", String(roomStats.upcoming)],
      ["Ended", String(roomStats.ended)],
    ];
    const conversationRows = [
      ["Conversation status", "Count"],
      ["Open", String(conversationStats.open)],
      ["Waiting", String(conversationStats.waiting)],
      ["Resolved", String(conversationStats.resolved)],
    ];
    const csv = [
      ["Metric", "Value"],
      ...metrics.map((m) => [m.label, m.value]),
      [],
      ["Day", "New members"],
      ...trendRows,
      [],
      ...roomRows,
      [],
      ...conversationRows,
    ]
      .map((row) =>
        row
          .map((cell) => {
            const normalized = String(cell).replace(/"/g, '""');
            return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "midigo-analytics-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify("Analytics report downloaded.");
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Reports & analytics"
        title="Platform performance."
        description="Follow growth, engagement, room activity, and support demand across the Midigo community."
        actions={
          <AdminButton onClick={downloadReport} variant="primary">
            Download report
          </AdminButton>
        }
      />

      <div className="admin-stats">
        {metrics.map((item) => (
          <div className="admin-stat-card" key={item.label}>
            <div className={`admin-stat-icon admin-stat-icon-${item.tone}`}>{item.icon}</div>
            <div>
              <span className="admin-stat-label">{item.label}</span>
              <strong className="admin-stat-value">{item.value}</strong>
              <p className="admin-stat-detail">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-analytics-grid">
        <AdminSection title="Member activity" description="Last 7 days" action={<AdminBadge tone="accent">{chartData.reduce((sum, d) => sum + Number(d.value), 0)} joins</AdminBadge>}>
          <div className="admin-chart" aria-label="Member activity chart">
            {chartData.map((item, index) => (
              <div className="admin-chart-column" key={item.label}>
                <span>{item.value}</span>
                <div
                  className="admin-chart-bar"
                  style={{ height: `${chartHeights[index] ?? 0}%` }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection
          title="Live room demand"
          description="Sessions by status"
          action={<AdminBadge tone="info">{roomStats.live + roomStats.upcoming} rooms</AdminBadge>}
        >
          <div className="admin-list">
            <div className="admin-list-item">
              <span className="admin-list-icon admin-list-icon-accent" aria-hidden="true">
                <IoRadioOutline />
              </span>
              <div className="admin-list-copy">
                <strong>Live now</strong>
                <p>
                  {roomStats.live} rooms · {roomStats.liveParticipants} participants
                </p>
              </div>
              <AdminBadge tone="accent">Active</AdminBadge>
            </div>
            <div className="admin-list-item">
              <span className="admin-list-icon admin-list-icon-info" aria-hidden="true">
                <IoCalendarOutline />
              </span>
              <div className="admin-list-copy">
                <strong>Upcoming</strong>
                <p>{roomStats.upcoming} scheduled sessions</p>
              </div>
              <AdminBadge tone="info">Scheduled</AdminBadge>
            </div>
            <div className="admin-list-item">
              <span className="admin-list-icon" aria-hidden="true">
                <IoCheckmarkCircleOutline />
              </span>
              <div className="admin-list-copy">
                <strong>Ended</strong>
                <p>{roomStats.ended} rooms completed</p>
              </div>
              <AdminBadge>Completed</AdminBadge>
            </div>
          </div>
        </AdminSection>
      </div>

      <div className="admin-analytics-grid">
        <AdminSection
          title="Conversation demand"
          description="Support overview"
          action={<AdminBadge tone="warning">{conversationStats.totalOpen} open</AdminBadge>}
        >
          <div className="admin-list">
            {activityItems.slice(0, 4).map((item) => (
              <div className="admin-list-item" key={item.title + item.time}>
                <span
                  className={`admin-list-icon admin-list-icon-${item.tone}`}
                  aria-hidden="true"
                >
                  <IoInformationCircleOutline />
                </span>
                <div className="admin-list-copy">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="admin-table-cell-secondary">{item.time}</span>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Recent signals" description="What changed" action={<AdminBadge tone="info">Live</AdminBadge>}>
          <div className="admin-list">
            {activityItems.map((item) => (
              <div className="admin-list-item" key={item.title + item.time + item.detail}>
                <span className={`admin-list-icon admin-list-icon-${item.tone}`} aria-hidden="true">
                  <IoInformationCircleOutline />
                </span>
                <div className="admin-list-copy">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="admin-table-cell-secondary">{item.time}</span>
              </div>
            ))}
          </div>
        </AdminSection>
      </div>

      {loading && (
        <p className="admin-table-cell-secondary" style={{ marginTop: "1rem" }}>
          Loading analytics…
        </p>
      )}
    </>
  );
}
