import Link from "next/link";
import { IoArrowForwardOutline } from "react-icons/io5";

const NEWS = [
  {
    id: "news-tokyo-shoot",
    date: "Sep 15, 2026",
    dateISO: "2026-09-15",
    title: "The Tokyo Neon Collection is Live",
    excerpt:
      "Midigo's latest digital photoshoot exploring the cyberpunk aesthetics of Neo-Tokyo is now available in the exclusive gallery. 12 stunning new ultra-HD renders.",
  },
  {
    id: "news-collab-announcement",
    date: "Sep 10, 2026",
    dateISO: "2026-09-10",
    title: "Surprise Collab: Midigo x Virtual Vogue",
    excerpt:
      "We're thrilled to announce Midigo will be the cover star for next month's issue of Virtual Vogue. Fans get early access to the unreleased cover concepts.",
  },
  {
    id: "news-new-feature",
    date: "Sep 05, 2026",
    dateISO: "2026-09-05",
    title: "New Feature: Personalized Voice Notes",
    excerpt:
      "Top-tier fans can now receive personalized, AI-generated voice notes from Midigo directly in their dashboard inbox. Opt-in now available.",
  },
];

export default function NewsPreview() {
  return (
    <section
      id="news"
      aria-labelledby="news-heading"
      className="section"
      style={{ borderBottom: "1px solid var(--border)" }}
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
            marginBottom: "3rem",
          }}
        >
          <div>
            <p className="label" style={{ marginBottom: "1rem" }}>
              The Latest
            </p>
            <h2
              id="news-heading"
              style={{
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                color: "var(--text-primary)",
                lineHeight: 1.1,
              }}
            >
              Updates from Midigo
            </h2>
          </div>

          <Link
            href="/dashboard/messages"
            id="news-view-all"
            aria-label="Read all news"
            style={{
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              flexShrink: 0,
            }}
            className="news-all-link"
          >
            All updates
            <IoArrowForwardOutline size={14} />
          </Link>
        </div>

        {/* News rows */}
        <ol aria-label="Recent news" style={{ listStyle: "none" }}>
          {NEWS.map((item, i) => (
            <li
              key={item.id}
              style={{
                borderTop: "1px solid var(--border)",
                borderBottom: i === NEWS.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <Link
                href="/dashboard/messages"
                id={item.id}
                aria-label={`Read: ${item.title}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "0.75rem",
                  padding: "2rem 0",
                  textDecoration: "none",
                }}
                className="news-row"
              >
                {/* Date */}
                <time
                  dateTime={item.dateISO}
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--text-muted)",
                  }}
                  className="news-date"
                >
                  {item.date}
                </time>

                {/* Title + excerpt wrapper */}
                <div>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.3,
                      marginBottom: "0.5rem",
                    }}
                    className="news-title"
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9375rem",
                      fontWeight: 300,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {item.excerpt}
                  </p>
                </div>

                {/* Read link */}
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    alignSelf: "start",
                  }}
                  className="news-read-link"
                >
                  Read more
                  <IoArrowForwardOutline size={12} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .news-row {
            grid-template-columns: 120px 1fr auto !important;
            align-items: start;
            gap: 2.5rem !important;
          }
          .news-date { padding-top: 4px; }
        }
        .news-row:hover .news-title { color: var(--purple); }
        .news-row:hover .news-read-link { color: var(--purple); }
        .news-all-link:hover { color: var(--text-secondary); }
      `}</style>
    </section>
  );
}
