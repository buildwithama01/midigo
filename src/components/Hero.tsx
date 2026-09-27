import Link from "next/link";

const LIVE_COUNT = "2,840";
const ROOMS_ACTIVE = 3;

export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-heading"
      style={{
        paddingTop: "calc(var(--nav-h) + 6rem)",
        paddingBottom: "7rem",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3.5rem",
          }}
          className="hero-grid"
        >
          {/* Left: editorial headline column */}
          <div style={{ maxWidth: 720 }}>
            {/* Pre-label */}
            <p
              className="label label-purple"
              style={{ marginBottom: "2rem" }}
              aria-label="Fansite for Midigo"
            >
              Exclusive Virtual Muse
            </p>

            {/* H1 — oversized two-line editorial headline */}
            <h1
              id="hero-heading"
              style={{
                fontSize: "clamp(2.75rem, 7vw, 5.25rem)",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
                marginBottom: "2rem",
              }}
            >
              Step into <span style={{ color: "var(--purple)" }}>Midigo</span>'s
              <br />
              digital world.
            </h1>

            {/* Supporting copy */}
            <p
              style={{
                fontSize: "1.125rem",
                fontWeight: 300,
                color: "var(--text-secondary)",
                lineHeight: 1.65,
                maxWidth: 520,
                marginBottom: "2.75rem",
              }}
            >
              Get closer to your favorite AI-generated model. Access exclusive photoshoots, behind-the-scenes content, and interact directly in intimate live chat rooms.
            </p>

            {/* CTAs */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginBottom: "3.5rem",
              }}
            >
              <Link
                href="/join"
                id="hero-cta-join"
                className="btn btn-lime"
                aria-label="Join the Midigo community"
              >
                Unlock Content
              </Link>
              <Link
                href="#about"
                id="hero-cta-explore"
                className="btn btn-ghost"
                aria-label="Learn more about Midigo"
              >
                Learn More
              </Link>
            </div>

            {/* Live community summary strip */}
            <div
              aria-label="Live community activity"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {/* Live indicator dot + member count */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  aria-hidden="true"
                  style={{
                    display: "inline-block",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--accent-strong)",
                    boxShadow: "0 0 0 2px var(--accent-glow)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "var(--text-muted)",
                    fontWeight: 500,
                  }}
                >
                  <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {LIVE_COUNT}
                  </strong>{" "}
                  fans online now
                </span>
              </div>

              {/* Thin divider */}
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: 1,
                  height: 16,
                  background: "var(--border-mid)",
                  flexShrink: 0,
                }}
              />

              {/* Active rooms */}
              <span
                style={{
                  fontSize: "0.8125rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                <strong style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {ROOMS_ACTIVE}
                  </strong>{" "}
                live chats active
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .hero-grid { grid-template-columns: 3fr 2fr; }
        }
      `}</style>
    </section>
  );
}
