import Link from "next/link";

const PAST_ROOMS = [
  {
    id: "pr1",
    date: "Sep 05",
    title: "The making of: Virtual Vogue Cover",
    participants: "12.4K",
  },
  {
    id: "pr2",
    date: "Aug 28",
    title: "Ask Midigo Anything #4",
    participants: "8.9K",
  },
  {
    id: "pr3",
    date: "Aug 15",
    title: "Feedback Session: Summer Aesthetics",
    participants: "15.2K",
  }
];

export default function PastRoomsList() {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {PAST_ROOMS.map(room => (
          <div
            key={room.id}
            style={{
              padding: "1.5rem 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
            className="past-row"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flex: 1, minWidth: "280px" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-muted)", minWidth: "60px" }}>
                {room.date}
              </span>
              <h4 style={{ fontSize: "1.0625rem", fontWeight: 500, color: "var(--text-primary)" }}>
                {room.title}
              </h4>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                {room.participants} views
              </span>
              <Link href="/dashboard/live-chats" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-purple)", textDecoration: "none" }}>
                View Recap
              </Link>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .past-row:first-child { border-top: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
