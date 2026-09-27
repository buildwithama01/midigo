export default function ChatsHeader() {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p className="label label-purple" style={{ marginBottom: "1rem" }}>
        Community Access
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
        Live Chats
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
        Participate in Midigo's exclusive Q&A sessions, view upcoming drops, and revisit past broadcasts.
      </p>
    </div>
  );
}
