import Link from "next/link";
import type { Database } from "@/src/lib/supabase/database.types";

type Article = Database["public"]["Tables"]["content_articles"]["Row"];

export default function LatestUpdates({ articles }: { articles: Article[] }) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.5rem",
        }}
      >
        <h3
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          Latest from Midigo
        </h3>
        <Link
          href="/dashboard/messages"
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          View feed
        </Link>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            No published updates yet.
          </p>
        ) : (
          articles.map((update) => (
            <Link
              key={update.id}
              href="/dashboard/messages"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                padding: "1.25rem",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                background: "var(--surface-2)",
                textDecoration: "none",
              }}
              className="update-card"
            >
              <div
                style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  minWidth: "48px",
                }}
              >
                {new Date(update.created_at).toLocaleDateString()}
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 500,
                    color: "var(--text-primary)",
                    marginBottom: "0.25rem",
                  }}
                >
                  {update.title}
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--text-purple)" }}>
                  {update.type}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
      <style>{`
        .update-card:hover { border-color: var(--border-mid); }
        .update-card:hover p:first-child { color: var(--purple); }
      `}</style>
    </div>
  );
}
