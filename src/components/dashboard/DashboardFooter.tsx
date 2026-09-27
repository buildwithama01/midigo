export default function DashboardFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "2rem 0",
        marginTop: "4rem",
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          Midigo
        </p>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Midigo. Fan Dashboard.
        </p>
      </div>
    </footer>
  );
}
