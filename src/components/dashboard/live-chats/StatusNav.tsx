export default function StatusNav({
  activeStatus,
  setActiveStatus,
}: {
  activeStatus: string;
  setActiveStatus: (status: string) => void;
}) {
  const statuses = ["Active", "Upcoming", "Past"];

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "2rem",
        borderBottom: "1px solid var(--border)",
        marginBottom: "3rem",
      }}
    >
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setActiveStatus(status)}
          style={{
            background: "transparent",
            border: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            padding: "0.875rem 0",
            color: activeStatus === status ? "var(--purple)" : "var(--text-secondary)",
            borderBottom: activeStatus === status ? "2px solid var(--purple)" : "2px solid transparent",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
            fontFamily: "inherit",
          }}
        >
          {status}
        </button>
      ))}
    </nav>
  );
}
