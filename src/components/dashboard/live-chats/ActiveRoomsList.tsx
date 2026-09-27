import Link from "next/link";

const ACTIVE_ROOMS = [
  {
    id: "ar1",
    title: "Wardrobe Vote: Next Gala",
    description: "Midigo needs your help deciding what to 'wear' to the virtual digital fashion gala. Come vote on the sketches.",
    members: 1045,
  },
  {
    id: "ar2",
    title: "Lo-Fi & Chill with Midigo",
    description: "No agenda, just vibing. A quiet room where Midigo streams her favorite lo-fi beats.",
    members: 327,
  }
];

export default function ActiveRoomsList() {
  return (
    <div>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2rem" }}>
        Other Active Chats
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {ACTIVE_ROOMS.map(room => (
          <div
            key={room.id}
            style={{
              padding: "2rem",
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
            className="room-card"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h4 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                  {room.title}
                </h4>
                <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "500px" }}>
                  {room.description}
                </p>
              </div>
              <Link href="/dashboard/live-chats" className="btn btn-ghost" style={{ flexShrink: 0 }}>
                Join Room
              </Link>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (min-width: 768px) {
          .room-card { flex-direction: row !important; align-items: center; justify-content: space-between; }
        }
      `}</style>
    </div>
  );
}
