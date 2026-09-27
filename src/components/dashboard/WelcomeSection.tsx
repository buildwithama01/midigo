export default function WelcomeSection({
  name,
  activeParticipants,
  liveRoomCount,
}: {
  name: string | null;
  activeParticipants: number;
  liveRoomCount: number;
}) {
  return (
    <div style={{ marginBottom: "3rem" }}>
      <p className="label label-purple" style={{ marginBottom: "1rem" }}>
        Member Dashboard
      </p>
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          lineHeight: 1.1,
          marginBottom: "1rem",
        }}
      >
        {name ? `Welcome, ${name}.` : "Welcome to Midigo."}
      </h1>
      <p
        style={{
          fontSize: "1.0625rem",
          fontWeight: 300,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "600px",
        }}
      >
        {activeParticipants} {activeParticipants === 1 ? "fan is" : "fans are"}{" "}
        in {liveRoomCount} {liveRoomCount === 1 ? "live room" : "live rooms"}{" "}
        right now.
      </p>
    </div>
  );
}
