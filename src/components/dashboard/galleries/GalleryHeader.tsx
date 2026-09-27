export default function GalleryHeader() {
  return (
    <div style={{ marginBottom: "2.5rem" }}>
      <p className="label label-purple" style={{ marginBottom: "1rem" }}>
        Exclusive Media
      </p>
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 3rem)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: "var(--text-primary)",
          lineHeight: 1.1,
          marginBottom: "1rem",
        }}
      >
        Media Vault
      </h1>
      <p
        style={{
          fontSize: "1.0625rem",
          fontWeight: 300,
          color: "var(--text-secondary)",
          lineHeight: 1.6,
          maxWidth: "600px",
        }}
      >
        Browse Midigo's private collection of high-resolution digital photography, outfits, and themed renders.
      </p>
    </div>
  );
}
