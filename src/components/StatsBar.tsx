const STATS = [
  { value: "48K+", label: "Dedicated Fans", note: "and growing weekly" },
  { value: "120+", label: "Exclusive Photoshoots", note: "unreleased high-res renders" },
  { value: "3", label: "Live Chats Weekly", note: "intimate real-time Q&A" },
  { value: "3.4M", label: "Messages Exchanged", note: "community interactions" },
];

export default function StatsBar() {
  return (
    <section
      aria-label="Community statistics"
      style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
      }}
    >
      <div className="container">
        <ol
          style={{
            listStyle: "none",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
          }}
          className="stats-grid"
        >
          {STATS.map((stat, i) => (
            <li
              key={stat.label}
              style={{
                padding: "2.5rem 0",
                borderRight: i % 2 === 0 ? "1px solid var(--border)" : "none",
                paddingLeft: i % 2 === 0 ? 0 : "2rem",
                paddingRight: i % 2 === 0 ? "2rem" : 0,
                borderBottom:
                  i < STATS.length - 2 ? "1px solid var(--border)" : "none",
              }}
              className={`stat-item stat-item-${i}`}
            >
              <p
                style={{
                  fontSize: "clamp(2rem, 5vw, 3.25rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "var(--text-primary)",
                  lineHeight: 1,
                  marginBottom: "0.625rem",
                }}
                aria-label={`${stat.value} ${stat.label}`}
              >
                {stat.value}
              </p>
              <p
                style={{
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "0.25rem",
                  letterSpacing: "0.01em",
                }}
              >
                {stat.label}
              </p>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {stat.note}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
          }
          .stat-item {
            border-right: 1px solid var(--border) !important;
            border-bottom: none !important;
            padding-left: 2rem !important;
            padding-right: 2rem !important;
          }
          .stat-item:first-child {
            padding-left: 0 !important;
          }
          .stat-item:last-child {
            border-right: none !important;
            padding-right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
}
