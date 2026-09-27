import Link from "next/link";

const UPCOMING_ROOMS = [
  {
    id: "up1",
    date: "Sep 20",
    time: "8:00 PM EST",
    title: "Behind the Pixels: Designing the Neon Collection",
    description: "An interactive breakdown of the new collection's cybernetic elements.",
  },
  {
    id: "up2",
    date: "Oct 01",
    time: "2:00 PM EST",
    title: "Community Town Hall",
    description: "Monthly discussion on upcoming features and vote on the next photoshoot location.",
  }
];

export default function UpcomingRoomsList() {
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {UPCOMING_ROOMS.map(room => (
          <div
            key={room.id}
            style={{
              padding: "2rem 0",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
            className="upcoming-row"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: "140px" }}>
              <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>{room.date}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>{room.time}</span>
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: "1.125rem", fontWeight: 500, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                {room.title}
              </h4>
              <p style={{ fontSize: "0.9375rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {room.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .upcoming-row:first-child { border-top: 1px solid var(--border); }
        @media (min-width: 768px) {
          .upcoming-row { flex-direction: row !important; align-items: center; }
        }
      `}</style>
    </div>
  );
}
