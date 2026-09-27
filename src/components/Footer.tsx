import Link from "next/link";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--surface-2)",
        borderTop: "1px solid var(--border)",
        paddingTop: "4rem",
        paddingBottom: "4rem",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gap: "3rem",
            marginBottom: "4rem",
          }}
          className="footer-grid"
        >
          {/* Brand Col */}
          <div>
            <Link
              href="/"
              aria-label="Midigo home"
              style={{
                fontSize: "1.3125rem",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "1rem",
              }}
            >
              Midigo
            </Link>
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: "280px",
              }}
            >
              Step into Midigo's digital world. Get closer to your favorite virtual muse.
            </p>
          </div>

          {/* Nav Links */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: "2rem",
            }}
            className="footer-navs"
          >
            <div>
              <p className="label" style={{ marginBottom: "1rem" }}>Platform</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li><Link href="/dashboard/live-chats" className="footer-link">Live Chats</Link></li>
                <li><Link href="/dashboard/galleries" className="footer-link">Galleries</Link></li>
                <li><Link href="/dashboard" className="footer-link">Fan Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <p className="label" style={{ marginBottom: "1rem" }}>Legal</p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <li><Link href="/sign-in" className="footer-link">Privacy Policy</Link></li>
                <li><Link href="/sign-in" className="footer-link">Terms of Service</Link></li>
                <li><Link href="/sign-in" className="footer-link">Community Guidelines</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderTop: "1px solid var(--border-mid)",
            paddingTop: "2rem",
          }}
          className="footer-bottom"
        >
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            &copy; {new Date().getFullYear()} Midigo. All rights reserved.
          </p>
        </div>
      </div>
      <style>{`
        .footer-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }
        .footer-link:hover {
          color: var(--text-primary);
        }
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 3fr !important;
          }
          .footer-bottom {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
        }
      `}</style>
    </footer>
  );
}
