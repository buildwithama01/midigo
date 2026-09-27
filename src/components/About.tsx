const FEATURES = [
  {
    number: "01",
    heading: "Exclusive Digital Photography",
    body: "Gain access to private, high-resolution galleries. From editorial fashion shoots to candid moments, see Midigo like never before in stunning AI-generated detail.",
  },
  {
    number: "02",
    heading: "Intimate Live Chats",
    body: "Interact in real-time. Join VIP chat rooms to ask questions, react to live streams, and connect with other top-tier fans in a moderated, exclusive space.",
  },
  {
    number: "03",
    heading: "Behind the Pixels",
    body: "Explore the creative process behind the virtual muse. Get early updates on upcoming outfits, collaborations, and vote on Midigo's next aesthetic.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="section"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="container">
        {/* Top: asymmetric editorial layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "3rem",
            marginBottom: "5rem",
          }}
          className="about-grid"
        >
          {/* Left col: heading + label */}
          <div>
            <p
              className="label"
              style={{ marginBottom: "1.5rem" }}
              aria-label="About Midigo"
            >
              The Experience
            </p>
            <h2
              id="about-heading"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "var(--text-primary)",
              }}
            >
              More than
              <br />
              just an image.
            </h2>
          </div>

          {/* Right col: copy */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: "1.25rem",
            }}
            className="about-copy"
          >
            <p
              style={{
                fontSize: "1.0625rem",
                fontWeight: 300,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              Midigo represents the bleeding edge of virtual fashion and digital influence. But beyond the public feeds lies an exclusive community tailored for her biggest supporters.
            </p>
            <p
              style={{
                fontSize: "1.0625rem",
                fontWeight: 300,
                color: "var(--text-secondary)",
                lineHeight: 1.7,
              }}
            >
              This is your private portal. Unlock a curated editorial experience designed to bring you closer to the digital icon.
            </p>
          </div>
        </div>

        {/* Feature list: numbered editorial blocks */}
        <ol
          aria-label="Midigo key features"
          style={{ listStyle: "none" }}
        >
          {FEATURES.map((f, i) => (
            <li
              key={f.number}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "1rem",
                paddingTop: "2.25rem",
                paddingBottom: "2.25rem",
                borderTop: "1px solid var(--border)",
                borderBottom: i === FEATURES.length - 1 ? "1px solid var(--border)" : "none",
              }}
              className="feature-row"
            >
              {/* Number */}
              <span
                aria-hidden="true"
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  color: "var(--purple)",
                  display: "block",
                  marginBottom: "0.25rem",
                }}
              >
                {f.number}
              </span>

              {/* Heading + body wrapper */}
              <div className="feature-content">
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                    marginBottom: "0.625rem",
                  }}
                >
                  {f.heading}
                </h3>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    fontWeight: 300,
                    color: "var(--text-secondary)",
                    lineHeight: 1.65,
                    maxWidth: 600,
                  }}
                >
                  {f.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .about-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 5rem !important;
            align-items: end;
          }
          .feature-row {
            grid-template-columns: 80px 1fr !important;
            gap: 2.5rem !important;
          }
        }
        @media (min-width: 1024px) {
          .about-grid {
            grid-template-columns: 5fr 7fr !important;
          }
        }
      `}</style>
    </section>
  );
}
