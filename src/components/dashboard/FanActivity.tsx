import type { DashboardOverviewData } from "@/src/lib/supabase/dashboard";

export default function FanActivity({
  conversations,
}: {
  conversations: DashboardOverviewData["conversations"];
}) {
  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "1.5rem",
      }}
    >
      <h3
        style={{
          fontSize: "1rem",
          fontWeight: 600,
          color: "var(--text-primary)",
          marginBottom: "1.5rem",
        }}
      >
        Recent Conversations
      </h3>
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {conversations.length === 0 ? (
          <li style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No conversations yet.
          </li>
        ) : (
          conversations.map((item, i) => (
            <li
              key={item.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                paddingBottom: i !== conversations.length - 1 ? "1rem" : 0,
                borderBottom:
                  i !== conversations.length - 1
                    ? "1px solid var(--border-mid)"
                    : "none",
              }}
            >
              <p
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {item.subject}
                </span>
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "capitalize",
                }}
              >
                {item.status} · {new Date(item.updated_at).toLocaleDateString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
