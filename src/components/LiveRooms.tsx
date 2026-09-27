import Link from "next/link";
import { IoArrowForwardOutline } from "react-icons/io5";

const ROOMS = [
  {
    id: "room-q-and-a",
    name: "Midnight Q&A",
    description:
      "Midigo answers your most burning questions live. Drop a comment and watch her respond in real-time.",
    members: 812,
    tag: "Interactive Chat",
  },
  {
    id: "room-behind-scenes",
    name: "Behind the Pixels: Tokyo Streetwear",
    description:
      "A look at the mood boards, prompts, and rendering tests for Midigo's upcoming Tokyo Streetwear collection.",
    members: 498,
    tag: "Behind the Scenes",
  },
  {
    id: "room-outfit-poll",
    name: "Wardrobe Vote: Next Gala",
    description:
      "Midigo needs your help deciding what to 'wear' to the virtual digital fashion gala. Come vote on the sketches.",
    members: 1045,
    tag: "Community Event",
  },
  {
    id: "room-chill-stream",
    name: "Lo-Fi & Chill with Midigo",
    description:
      "No agenda, just vibing. A quiet room where Midigo streams her favorite lo-fi beats while 'working' on new content.",
    members: 327,
    tag: "Hangout",
  },
];

export default function LiveRooms() {
  return (
    <section
      id="live-rooms"
      aria-labelledby="rooms-heading"
      className="section"
      style={{ background: "var(--purple-bg)" }}
    >
      <div className="container">
        {/* Section header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1.5rem",
            marginBottom: "3.5rem",
          }}
        >
          <div>
            <p
              className="label label-purple"
              style={{ marginBottom: "1rem" }}
            >
              Live Now
            </p>
            <h2
              id="rooms-heading"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              Exclusive chat rooms
            </h2>
          </div>
          <Link
            href="/dashboard/live-chats"
            id="rooms-view-all"
            aria-label="View all live rooms"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text-purple)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              flexShrink: 0,
            }}
            className="rooms-view-all-link"
          >
            Enter the portal
            <IoArrowForwardOutline size={14} />
          </Link>
        </div>

        {/* 2×2 grid of room cards */}
        <ol
          aria-label="Live rooms list"
          style={{
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            overflow: "hidden",
          }}
          className="rooms-grid"
        >
          {ROOMS.map((room) => (
            <li key={room.id} style={{ background: "var(--surface-2)" }}>
              <Link
                href="/dashboard/live-chats"
                id={room.id}
                aria-label={`Enter room: ${room.name}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  padding: "2rem",
                  textDecoration: "none",
                }}
                className="room-card"
              >
                {/* Tag */}
                <p
                  className="label"
                  style={{
                    color: "var(--text-purple)",
                    marginBottom: "1rem",
                  }}
                >
                  {room.tag}
                </p>

                {/* Name */}
                <h3
                  style={{
                    fontSize: "1.0625rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                    lineHeight: 1.3,
                    marginBottom: "0.75rem",
                  }}
                >
                  {room.name}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 300,
                    color: "var(--text-secondary)",
                    lineHeight: 1.6,
                    flexGrow: 1,
                    marginBottom: "1.5rem",
                  }}
                >
                  {room.description}
                </p>

                {/* Footer row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  {/* Member count */}
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
                      aria-hidden="true"
                      style={{
                        display: "inline-block",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--accent-strong)",
                      }}
                    />
                    {room.members.toLocaleString()} fans chatting
                  </span>

                  {/* Directional CTA */}
                  <span
                    aria-hidden="true"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--text-purple)",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                    className="room-enter-label"
                  >
                    Join
                    <IoArrowForwardOutline size={12} />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @media (min-width: 640px) {
          .rooms-grid { grid-template-columns: 1fr 1fr !important; }
        }
        .room-card:hover .room-enter-label { color: var(--accent-strong); }
        .room-card:hover h3 { color: var(--accent-strong); }
        .rooms-view-all-link:hover { color: var(--accent-strong); }
      `}</style>
    </section>
  );
}
