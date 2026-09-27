import Image from "next/image";
import Link from "next/link";

export default function FeaturedCollection() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "2rem",
        marginBottom: "4rem",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
      className="featured-collection-grid"
    >
      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", backgroundColor: "var(--surface)" }}>
        <Image
          src="/images/midigo_tokyo_1.jpg"
          alt="Midigo in Tokyo Streetwear"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "2rem",
        }}
        className="featured-content"
      >
        <p className="label label-purple" style={{ marginBottom: "1rem" }}>Featured Drop</p>
        <h2
          style={{
            fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
            lineHeight: 1.1,
          }}
        >
          Neon Tokyo Streetwear
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "2rem",
            fontWeight: 300,
          }}
        >
          Explore the intersection of cybernetic high-fashion and rainy neon aesthetics. This exclusive 12-piece gallery showcases Midigo's latest interactive outfit vote winners.
        </p>
        <Link href="/dashboard/galleries" className="btn btn-lime" style={{ alignSelf: "flex-start" }}>
          View Full Collection
        </Link>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .featured-collection-grid {
            grid-template-columns: 3fr 2fr !important;
            gap: 0 !important;
          }
          .featured-content { padding: 4rem !important; }
        }
      `}</style>
    </div>
  );
}
