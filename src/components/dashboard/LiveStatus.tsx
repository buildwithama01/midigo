import Link from "next/link";
import type { Database } from "@/src/lib/supabase/database.types";

type LiveRoom = Database["public"]["Tables"]["live_rooms"]["Row"];

export default function LiveStatus({ room }: { room: LiveRoom | null }) {
  if (!room) return null;

  return (
    <div
      style={{
        background: "var(--purple-bg)",
        border: "1px solid var(--border-mid)",
        borderRadius: "8px",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        marginBottom: "3rem",
      }}
      className="live-status-card"
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.75rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--accent-strong)",
                boxShadow: "0 0 0 2px var(--accent-glow)",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--accent-strong)",
              }}
            >
              Midigo is Live
            </span>
          </div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              marginBottom: "0.5rem",
            }}
          >
            {room.title}
          </h2>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-purple)",
              fontWeight: 300,
            }}
          >
            Join {room.host} and {room.current_participants}{" "}
            {room.current_participants === 1 ? "other fan" : "other fans"}{" "}
            chatting live right now.
          </p>
        </div>

        <Link
          href="/dashboard/live-chats"
          className="btn btn-lime"
          style={{ flexShrink: 0 }}
        >
          Join Chat
        </Link>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .live-status-card > div { flex-direction: row; align-items: center !important; }
        }
      `}</style>
    </div>
  );
}
