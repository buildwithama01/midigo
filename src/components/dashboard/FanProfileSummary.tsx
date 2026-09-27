import type { DashboardOverviewData } from "@/src/lib/supabase/dashboard";

export default function FanProfileSummary({
  profile,
}: {
  profile: DashboardOverviewData["profile"];
}) {
  if (!profile) {
    return (
      <div
        style={{
          padding: "1.5rem",
          border: "1px solid var(--border)",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "var(--text-muted)" }}>
          Sign in to view your account details.
        </p>
      </div>
    );
  }

  const displayName = profile.name || profile.handle || profile.email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "var(--purple-bg)",
            border: "1px solid var(--purple)",
            color: "var(--text-purple)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
            fontWeight: 600,
          }}
        >
          {initials}
        </div>
        <div>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "var(--text-primary)",
            }}
          >
            {displayName}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Joined {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          borderTop: "1px solid var(--border-mid)",
          paddingTop: "1.5rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              textTransform: "capitalize",
            }}
          >
            {profile.membership}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Membership
          </p>
        </div>
        <div>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              textTransform: "capitalize",
            }}
          >
            {profile.role}
          </p>
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              fontWeight: 500,
            }}
          >
            Account role
          </p>
        </div>
      </div>
    </div>
  );
}
