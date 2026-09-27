export default function InboxHeader({
  unreadCount = 0,
}: { unreadCount?: number } = {}) {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p className="label label-purple" style={{ marginBottom: "1rem" }}>
        Private Messages
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1.1,
          }}
        >
          Messages
        </h1>
        {unreadCount > 0 && (
          <span
            style={{
              background: "var(--purple)",
              color: "var(--on-accent)",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.625rem",
              borderRadius: "999px",
            }}
          >
            {unreadCount} new
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: "1.0625rem",
          fontWeight: 300,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "500px",
        }}
      >
        Direct messages and personalized voice notes from Midigo, just for you.
      </p>
    </div>
  );
}
