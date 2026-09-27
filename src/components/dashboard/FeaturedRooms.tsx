import Link from "next/link";
import type { Database } from "@/src/lib/supabase/database.types";

type LiveRoom = Database["public"]["Tables"]["live_rooms"]["Row"];

export default function FeaturedRooms({ rooms }: { rooms: LiveRoom[] }) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Featured Chats
        </h3>
        <Link
          href="/dashboard/live-chats"
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {rooms.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            No live or upcoming chats are scheduled.
          </p>
        ) : (
          rooms.map((room) => (
            <Link
              key={room.id}
              href="/dashboard/live-chats"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "1.5rem",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
              className="room-card-mini"
            >
              <h4
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  lineHeight: 1.3,
                }}
              >
                {room.title}
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: "auto",
                }}
              >
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background:
                        room.status === "live"
                          ? "var(--accent-strong)"
                          : "var(--text-muted)",
                    }}
                  />
                  {room.status === "live"
                    ? `${room.current_participants} fans chatting`
                    : room.scheduled_at
                      ? new Date(room.scheduled_at).toLocaleString()
                      : "Upcoming"}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-purple)",
                  }}
                >
                  Join
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
      <style>{`
        .room-card-mini:hover { border-color: var(--border-mid); }
        .room-card-mini:hover h4 { color: var(--accent-strong); }
      `}</style>
    </div>
  );
}
